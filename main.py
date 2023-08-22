import os, json, asyncio, sys, time
from os import path, mkdir

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

sys.path.append(os.path.dirname(__file__))

from css_utils import Log, create_dir, create_steam_symlink, Result, get_user_home, get_theme_path, store_read as util_store_read, store_write as util_store_write, FLAG_KEEP_DEPENDENCIES, FLAG_PRESET, store_or_file_config
from css_inject import Inject, ALL_INJECTS
from css_theme import Theme, CSS_LOADER_VER
from css_themepatch import ThemePatch
from css_remoteinstall import install

from css_server import start_server
from css_browserhook import initialize, remove_all, commit_all

ALWAYS_RUN_SERVER = False
IS_STANDALONE = False

try:
    if not store_or_file_config("no_redirect_logs"):
        import decky_plugin
except:
    pass

Initialized = False

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, plugin, loop):
        self.plugin = plugin
        self.loop = loop
        self.last = 0
        self.delay = 1

    def on_modified(self, event):
        #Log(f"FS Event: {event}")

        if (not (event.src_path.endswith(".css") or event.src_path.endswith("theme.json"))) or event.is_directory:
            #Log("FS Event is not on a CSS file. Ignoring!")
            return

        if ((self.last + self.delay) < time.time() and not self.plugin.busy):
            self.last = time.time()
            Log("Reloading themes due to FS event")
            self.loop.create_task(self.plugin.reset(self.plugin))
        

class Plugin:
    async def is_standalone(self) -> bool:
        return IS_STANDALONE
    
    async def get_watch_state(self) -> bool:
        return self.observer != None
    
    async def get_server_state(self) -> bool:
        return self.server_loaded

    async def enable_server(self) -> dict:
        if self.server_loaded:
            return Result(False, "Nothing to do!").to_dict()
        
        start_server(self)
        self.server_loaded = True
        return Result(True).to_dict()
    
    async def toggle_watch_state(self, enable : bool = True) -> dict:
        if enable and self.observer == None:
            Log("Observing themes folder for file changes")
            self.observer = Observer()
            self.handler = FileChangeHandler(self, asyncio.get_running_loop())
            self.observer.schedule(self.handler, get_theme_path(), recursive=True)
            self.observer.start()
            return Result(True).to_dict()
        elif self.observer != None and not enable:
            Log("Stopping observer")
            self.observer.stop()
            self.observer = None
            return Result(True).to_dict()
        
        return Result(False, "Nothing to do!").to_dict()

    async def dummy_function(self) -> bool:
        return True

    async def fetch_theme_path(self) -> str:
        return get_theme_path()

    async def get_themes(self) -> list:
        return [x.to_dict() for x in self.themes]
    
    async def set_theme_state(self, name : str, state : bool, set_deps : bool = True, set_deps_value : bool = True) -> dict:
        Log(f"Setting state for {name} to {state}")
        theme = await self._get_theme(self, name)

        if theme == None:
            return Result(False, f"Did not find theme {name}").to_dict()

        try:
            if state:
                result = await self._enable_theme(self, theme, set_deps, set_deps_value)
            else:
                result = await self._disable_theme(self, theme, FLAG_KEEP_DEPENDENCIES in theme.flags)

            await commit_all()
            return result.to_dict()
        except Exception as e:
            return Result(False, str(e))
    
    async def _enable_theme(self, theme : Theme, set_deps : bool = True, set_deps_value : bool = True, ignore_dependencies : list = []) -> Result:
        if theme is None:
            return Result(False)
        
        if set_deps:
            theme_dependencies = [x for x in theme.dependencies]
            # Make the top level control all dependencies it defines
            ignore_dependencies_next = ignore_dependencies.copy()
            ignore_dependencies_next.extend(theme_dependencies)

            # Disallow dependencies of a preset to override anything
            if (FLAG_PRESET in theme.flags):
                set_deps = False

            # Make sure higher priority themes are sorted right
            theme_dependencies.sort(key=lambda d: self.scores[d] if d in self.scores else 0)

            for dependency_name in theme_dependencies:
                # Skip any themes that the previous iteration has control over
                if (dependency_name in ignore_dependencies):
                    continue

                dependency = await self._get_theme(self, dependency_name)
                if dependency == None:
                    continue

                if set_deps_value:
                    if dependency.enabled:
                        await dependency.remove()

                    for dependency_patch_name in theme.dependencies[dependency_name]:
                        dependency_patch_value = theme.dependencies[dependency_name][dependency_patch_name]
                        for dependency_patch in dependency.patches:
                            if dependency_patch.name == dependency_patch_name:
                                dependency_patch.set_value(dependency_patch_value)

                await self._enable_theme(self, dependency, set_deps, set_deps_value, ignore_dependencies_next)
        
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

        await remove_all()
        fails = await self._load(self)
        await self._load_stage_2(self)
        await commit_all()
        self.busy = False
        
        return {
            "fails": fails
        }

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
        try:
            deps = {}

            for x in self.themes:
                if x.enabled and FLAG_PRESET not in x.flags:
                    deps[x.name] = {}
                    for y in x.patches:
                        deps[x.name][y.name] = y.get_value()

            result = await self._generate_preset_theme_internal(self, name, deps)
            return result.to_dict()
        except Exception as e:
            return Result(False, str(e))
    
    async def generate_preset_theme_from_theme_names(self, name : str, themeNames : list) -> dict:
        try:
            deps = {}

            for x in self.themes:
                if x.name in themeNames and FLAG_PRESET not in x.flags:
                    deps[x.name] = {}
                    for y in x.patches:
                        deps[x.name][y.name] = y.get_value()

            result = await self._generate_preset_theme_internal(self, name, deps)
            return result.to_dict()
        except Exception as e:
            return Result(False, str(e))    

    async def _generate_preset_theme_internal(self, name : str, deps : dict) -> Result:
        Log(f"Generating theme preset '{name}'...")
        a = await self._get_theme(self, name)
        if a != None and FLAG_PRESET not in a.flags:
            return Result(False, f"Theme '{name}' already exists")
        
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

        for x in self.themes:
            if x.name == name: # Hotpatch preset in memory
                Log(f"Updating dependencies for {name}: {deps}")
                x.dependencies = deps
                break
        
        return Result(True)

    async def _parse_themes(self, themesDir : str, configDir : str = None) -> list[tuple[str, str]]:
        if (configDir is None):
            configDir = themesDir

        possibleThemeDirs = [str(x) for x in os.listdir(themesDir)]
        fails = []

        for x in possibleThemeDirs:
            themePath = themesDir + "/" + x
            configPath = configDir + "/" + x
            themeDataPath = themePath + "/theme.json"

            if not os.path.isdir(themePath):
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
                fails.append((x, str(e)))

        return fails

    async def _cache_lists(self):
        ALL_INJECTS.clear()

        for x in self.themes:
            injects = x.get_all_injects()
            ALL_INJECTS.extend(injects)

    async def _load(self) -> list[tuple[str, str]]:
        Log("Loading themes...")
        self.themes = []

        themesPath = get_theme_path()
        self.last_load_errors = await self._parse_themes(self, themesPath)
        return self.last_load_errors
    
    async def _set_theme_score(self, theme : Theme):
        if theme.name not in self.scores:
            self.scores[theme.name] = 0
            self.scores[theme.name] += theme.priority_mod
        
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

    async def exit(self):
        try:
            import css_win_tray
            css_win_tray.stop_icon()
        except:
            pass

        sys.exit(0)
    
    async def get_last_load_errors(self):
        return {
            "fails": self.last_load_errors
        }

    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True
        self.observer = None
        self.server_loaded = False

        await asyncio.sleep(1)

        self.busy = False
        self.themes = []
        self.last_load_errors = []
        Log("Initializing css loader...")
        Log(f"Max supported manifest version: {CSS_LOADER_VER}")
        
        create_steam_symlink()

        await self._load(self)
        #await self._inject_test_element(self, "SP", 9999, "test_ui_loaded")
        await self._load_stage_2(self, False)

        if (store_or_file_config("watch")):
            await self.toggle_watch_state(self)
        else:
            Log("Not observing themes folder for file changes")

        Log(f"Initialized css loader. Found {len(self.themes)} themes. Total {len(ALL_INJECTS)} injects, {len([x for x in ALL_INJECTS if x.enabled])} injected")
        
        if (ALWAYS_RUN_SERVER or store_or_file_config("server")):
            await self.enable_server(self)

        await initialize()

if __name__ == '__main__':
    ALWAYS_RUN_SERVER = True
    IS_STANDALONE = True
    import logging

    logging.basicConfig(
        format='[%(asctime)s][%(levelname)s]: %(message)s',
        force=True,
        filename=os.path.join(get_theme_path(), "standalone.log"),
        filemode="w"
    )

    Logger = logging.getLogger("CSS_LOADER")
    Logger.addHandler(logging.StreamHandler())
    Logger.setLevel(logging.INFO)

    asyncio.set_event_loop(asyncio.new_event_loop())

    class A:
        async def run(self):
            count = 0
            while count < 5:
                try:
                    task = asyncio.create_task(Plugin._main(Plugin))
                    await asyncio.shield(task)
                except asyncio.CancelledError as e:
                    print(str(e))
                except Exception as e:
                    print(str(e))
                
                count += 1

    asyncio.get_event_loop().run_until_complete(A().run())

    import css_win_tray
    
    css_win_tray.start_icon(Plugin, asyncio.get_event_loop())

    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        pass

    css_win_tray.stop_icon()