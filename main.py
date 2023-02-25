import os, json, asyncio, sys, time
from os import path, mkdir

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

sys.path.append(os.path.dirname(__file__))

from css_utils import Log, create_dir, create_steam_symlink, Result, get_user_home, get_theme_path, store_read as util_store_read, store_write as util_store_write, FLAG_KEEP_DEPENDENCIES, FLAG_PRESET
from css_inject import Inject
from css_theme import Theme, CSS_LOADER_VER
from css_themepatch import ThemePatch
from css_remoteinstall import install
from css_tab_mapping import load_tab_mappings, get_single_tab, get_tabs, commit_all

Initialized = False

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, plugin, loop):
        self.plugin = plugin
        self.loop = loop
        self.last = 0
        self.delay = 5

    def on_modified(self, event):
        #Log(f"FS Event: {event}")

        if (not event.src_path.endswith(".css")) or event.is_directory:
            #Log("FS Event is not on a CSS file. Ignoring!")
            return

        if ((self.last + self.delay) < time.time() and not self.plugin.busy):
            self.last = time.time()
            Log("Reloading themes due to FS event")
            self.loop.create_task(self.plugin.reset(self.plugin))
        

class Plugin:
    async def dummy_function(self) -> bool:
        return True

    async def fetch_theme_path(self) -> str:
        return get_theme_path()

    async def get_themes(self) -> list:
        return [x.to_dict() for x in self.themes]
    
    async def set_theme_state(self, name : str, state : bool) -> dict:
        Log(f"Setting state for {name} to {state}")
        theme = await self._get_theme(self, name)

        if theme == None:
            return Result(False, f"Did not find theme {name}").to_dict()

        try:
            if state:
                result = await self._enable_theme(self, theme)
            else:
                result = await self._disable_theme(self, theme, FLAG_KEEP_DEPENDENCIES in theme.flags)

            await commit_all()
            return result.to_dict()
        except Exception as e:
            return Result(False, str(e))
    
    async def _enable_theme(self, theme : Theme) -> Result:
        if theme is None:
            return Result(False)
        
        for dependency_name in theme.dependencies:
            dependency = await self._get_theme(self, dependency_name)
            if dependency == None:
                continue

            if dependency.enabled:
                await dependency.remove()

            for dependency_patch_name in theme.dependencies[dependency_name]:
                dependency_patch_value = theme.dependencies[dependency_name][dependency_patch_name]
                for dependency_patch in dependency.patches:
                    if dependency_patch.name == dependency_patch_name:
                        dependency_patch.set_value(dependency_patch_value)
                
            await self._enable_theme(self, dependency)
        
        result = await theme.inject()
        return result

    async def _disable_theme(self, theme : Theme, keep_dependencies : bool) -> Result:
        if theme is None:
            return Result(False)

        result = await theme.remove()

        if keep_dependencies or not result.success:
            return result

        for dependency_name in theme.dependencies:
            dependency = await self._get_theme(self, dependency_name)

            if dependency == None:
                continue
        
            used = False

            for x in self.themes:
                if x.enabled and dependency.name in [y for y in x.dependencies]:
                    used = True
                    break

            if not used:
                await self._disable_theme(self, dependency, False)
        
        return result


    async def download_theme_from_url(self, id : str, url : str) -> dict:
        local_themes = [x.name for x in self.themes]
        return (await install(id, url, local_themes)).to_dict()

    async def get_backend_version(self) -> int:
        return CSS_LOADER_VER
    
    async def _get_theme(self, themeName : str) -> Theme | None:
        for x in self.themes:
            if x.name == themeName:
                return x
        
        return None

    async def _get_patch_of_theme(self, themeName : str, patchName : str) -> ThemePatch:
        theme = None
        for x in self.themes:
            if (x.name == themeName):
                theme = x
                break
        
        if theme is None:
            raise Exception(f"Did not find theme '{themeName}'")
        
        themePatch = None
        for x in theme.patches:
            if (x.name == patchName):
                themePatch = x
                break
        
        if themePatch is None:
            raise Exception(f"Did not find patch '{patchName}' for theme '{themeName}'")
        
        return themePatch

    async def set_patch_of_theme(self, themeName : str, patchName : str, value : str) -> dict:
        try:
            themePatch = await self._get_patch_of_theme(self, themeName, patchName)
        except Exception as e:
            return Result(False, str(e))
        
        if (themePatch.value == value):
            return Result(True, "Already injected").to_dict()

        if (value in themePatch.options):
            themePatch.value = value
        
        if (themePatch.theme.enabled):
            await themePatch.remove()
            await themePatch.inject()
        
        await themePatch.theme.save()
        await commit_all()
        return Result(True).to_dict()
    
    async def set_component_of_theme_patch(self, themeName : str, patchName : str, componentName : str, value : str) -> dict:
        try:
            themePatch = await self._get_patch_of_theme(self, themeName, patchName)
        except Exception as e:
            return Result(False, str(e))

        component = None
        for x in themePatch.components:
            if x.name == componentName:
                component = x
                break
        
        if component == None:
            return Result(False, f"Failed to find component '{componentName}'")
        
        component.value = value
        result = await component.generate_and_reinject()
        if not result.success:
            return result

        await themePatch.theme.save()
        await commit_all()
        return Result(True).to_dict()
    
    async def reset(self) -> dict:
        self.busy = True
        for x in self.injects:
            await x.remove()

        await self._load(self)
        await self._load_stage_2(self)
        await commit_all()
        self.busy = False
        return Result(True).to_dict()

    async def delete_theme(self, themeName : str) -> dict:
        theme = None

        for x in self.themes:
            if x.name == themeName:
                theme = x
                break
                
        if (theme == None):
            return Result(False, f"Could not find theme {themeName}").to_dict()
        
        result = await theme.delete()
        if not result.success:
            return result.to_dict()
        
        self.themes.remove(theme)
        await self._cache_lists(self)
        return Result(True).to_dict()

    async def store_read(self, key : str) -> str:
        return util_store_read(key)
    
    async def store_write(self, key : str, val : str) -> dict:
        util_store_write(key, val)
        return Result(True).to_dict()

    async def generate_preset_theme(self, name : str) -> dict:
        Log("Generating theme preset...")

        try:
            result = await self._generate_preset_theme_internal(self, name)
            return result.to_dict()
        except Exception as e:
            return Result(False, str(e))

    async def _generate_preset_theme_internal(self, name : str) -> Result:
        a = await self._get_theme(self, name)
        if a != None and FLAG_PRESET not in a.flags:
            return Result(False, f"Theme '{name}' already exists")
        
        deps = {}

        for x in self.themes:
            if x.enabled and FLAG_PRESET not in x.flags:
                deps[x.name] = {}
                for y in x.patches:
                    deps[x.name][y.name] = y.get_value()
        
        theme_path = path.join(get_theme_path(), name)

        if not path.exists(theme_path):
            mkdir(theme_path)
        
        with open(path.join(theme_path, "theme.json"), "w") as fp:
            json.dump({
                "name": name,
                "manifest_version": CSS_LOADER_VER,
                "flags": [FLAG_PRESET],
                "dependencies": deps
            }, fp)
        
        return Result(True)

    async def _inject_test_element(self, tab : str, timeout : int = 3, element_name : str = "test_css_loaded") -> Result:
        attempt = 0
        while True:
            if await self._check_test_element(self, tab, element_name):
                return Result(True)
            else:
                try:
                    found_tab = get_single_tab(tab)
                    await found_tab.evaluate_js(
                    f"""
                    (function() {{
                        const elem = document.createElement('div');
                        elem.id = "{element_name}";
                        document.head.append(elem);
                    }})()
                    """)
                except Exception as e:
                    Log(str(e))
                    pass

                attempt += 1

                if (attempt >= timeout):
                    return Result(False, f"Inject into tab '{tab}' was attempted {timeout} times, stopping")

                await asyncio.sleep(1)
            
    
    async def _check_test_element(self, tab : str, element_name : str = "test_css_loaded") -> bool:
        try:
            found_tab = get_single_tab(tab)
            return await found_tab.has_element(element_name) # I'm aware this will throw an exception if found_tab is None
        except:
            return False

    async def _parse_themes(self, themesDir : str, configDir : str = None):
        if (configDir is None):
            configDir = themesDir

        possibleThemeDirs = [str(x) for x in os.listdir(themesDir)]

        for x in possibleThemeDirs:
            themePath = themesDir + "/" + x
            configPath = configDir + "/" + x
            themeDataPath = themePath + "/theme.json"

            if (not path.exists(themeDataPath)) and (not path.exists(os.path.join(themePath, "theme.css"))):
                continue
        
            Log(f"Analyzing theme {x}")
            
            try:
                theme = None
                if path.exists(themeDataPath):
                    with open(themeDataPath, "r") as fp:
                        theme = json.load(fp)
                    
                themeData = Theme(themePath, theme, configPath)

                if (themeData.name not in [x.name for x in self.themes]):
                    self.themes.append(themeData)
                    Log(f"Adding theme {themeData.name}")

            except Exception as e:
                Log(f"Exception while parsing a theme: {e}") # Couldn't properly parse everything

    async def _cache_lists(self):
        self.injects = []
        self.tabs = []

        for x in self.themes:
            injects = x.get_all_injects()
            self.injects.extend(injects)
            for y in injects:
                for z in y.tabs:
                    if z not in self.tabs:
                        self.tabs.append(z)

    async def _check_tabs(self):
        while True:
            await asyncio.sleep(3)
            for x in self.tabs:
                try:
                    if not await x.available():
                        continue # Tab does not exist, so not worth injecting into it

                    # Log(f"Checking if tab {x} is still injected...")
                    if not await self._check_test_element(self, x.get_name()):
                        Log(f"Tab {x.get_name()} is not injected, reloading...")
                        await self._inject_test_element(self, x.get_name())
                        for y in self.injects:
                            if y.enabled:
                                (await y.inject(x)).raise_on_failure()

                        await x.commit_css_transaction()
                except Exception as e:
                    Log(f":( {str(e)}")
                    pass

    async def _load(self):
        Log("Loading themes...")
        self.themes = []

        themesPath = f"{get_user_home()}/homebrew/themes"
        defaultThemesPath = f"{get_user_home()}/homebrew/plugins/SDH-CssLoader/themes"

        if (not path.exists(themesPath)):
            create_dir(themesPath)

        await self._parse_themes(self, themesPath)
        if (path.exists(defaultThemesPath)):
            await self._parse_themes(self, defaultThemesPath, themesPath)
    
    async def _set_theme_score(self, theme : Theme):
        if theme.name not in self.scores:
            self.scores[theme.name] = 0
        
        for x in theme.dependencies:
            dependency = await self._get_theme(self, x)
            if dependency is not None:
                await self._set_theme_score(self, dependency)
                self.scores[dependency.name] -= 1

    async def _load_stage_2(self, inject_now : bool = True):
        self.scores = {}
        for x in self.themes:
            await self._set_theme_score(self, x)
        
        Log(self.scores)
        self.themes.sort(key=lambda d: self.scores[d.name])

        for x in self.themes:
            Log(f"Loading theme {x.name}")
            await x.load(inject_now)
        
        await self._cache_lists(self)
        self.themes.sort(key=lambda d: d.name)

    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True

        await asyncio.sleep(1)

        self.busy = False
        self.themes = []
        Log("Initializing css loader...")
        Log(f"Max supported manifest version: {CSS_LOADER_VER}")
        
        await create_steam_symlink()
        load_tab_mappings()

        await self._load(self)
        await self._inject_test_element(self, "SP", 9999, "test_ui_loaded")
        await self._load_stage_2(self, False)

        if (os.path.exists(f"{get_theme_path()}/WATCH")):
            Log("Observing themes folder for file changes")
            self.observer = Observer()
            self.handler = FileChangeHandler(self, asyncio.get_running_loop())
            self.observer.schedule(self.handler, get_theme_path(), recursive=True)
            self.observer.start()
        else:
            Log("Not observing themes folder for file changes")

        Log(f"Initialized css loader. Found {len(self.themes)} themes, which inject into {len(self.tabs)} tabs ({self.tabs}). Total {len(self.injects)} injects, {len([x for x in self.injects if x.enabled])} injected")
        await self._check_tabs(self)