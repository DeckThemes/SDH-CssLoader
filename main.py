import os, json, asyncio, sys
from os import path

sys.path.append(os.path.dirname(__file__))

from css_utils import Log, create_dir, create_symlink, Result, get_user_home, get_theme_path
from css_inject import Inject
from css_theme import Theme, CSS_LOADER_VER
from css_themepatch import ThemePatch
from css_remoteinstall import RemoteInstall
from css_tab_mapping import get_multiple_tab_mappings, load_tab_mappings, tab_has_element, tab_exists, inject_to_tab

Initialized = False

class Plugin:
    async def dummy_function(self) -> bool:
        return True

    async def fetch_theme_path(self) -> str:
        return get_theme_path()

    async def get_themes(self) -> list:
        return [x.to_dict() for x in self.themes]
    
    async def set_theme_state(self, name : str, state : bool) -> dict:
        Log(f"Setting state for {name} to {state}")
        for x in self.themes:
            if (x.name == name):
                if state:
                    for y in x.dependencies:
                        dependency = await self._get_theme(self, y)
                        if dependency is not None:
                            if dependency.enabled:
                                await dependency.remove()
                            
                            for z in x.dependencies[y]:
                                value = x.dependencies[y][z]
                                for patch in dependency.patches:
                                    if patch.name == z:
                                        patch.set_value(value)
                            
                            await self.set_theme_state(self, dependency.name, True)

                result = await x.inject() if state else await x.remove()
                return result.to_dict()
        
        return Result(False, f"Did not find theme {name}").to_dict()

    async def download_theme(self, uuid : str) -> dict:
        try:
            theme_db_entry = await self.remote.get_theme_db_entry_by_uuid(uuid)
        except Exception as e:
            return Result(False, str(e)).to_dict()

        result = await theme_db_entry.install()
        if not result.success:
            return result.to_dict()

        possibleThemeJsonPath = os.path.join(get_theme_path(), theme_db_entry.name, "theme.json")
        if (os.path.exists(possibleThemeJsonPath)):
            with open(possibleThemeJsonPath, "r") as fp:
                theme = json.load(fp)
            
            try:
                parsedTheme = Theme(possibleThemeJsonPath, theme)
            except Exception as e:
                return Result(False, str(e)).to_dict()

            for x in parsedTheme.dependencies:
                found = False
                for y in self.themes:
                    if y.name == x:
                        found = True
                        break
                
                if not found:
                    try:
                        theme_db_dependency = await self.remote.get_theme_db_entry_by_name(x)
                        result = await self.download_theme(self, theme_db_dependency.id)
                        if not result["success"]:
                            raise Exception(result["message"])
                    except Exception as e:
                        return Result(False, str(e)).to_dict()

        return Result(True).to_dict()
    
    async def get_theme_db_data(self) -> list:
        return [x.to_dict() for x in self.remote.themes]
    
    async def reload_theme_db_data(self) -> dict:
        return (await self.remote.load(True)).to_dict()

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
        return Result(True).to_dict()
    
    async def reset(self) -> dict:
        for x in self.injects:
            await x.remove()

        await self._load(self)
        await self._load_stage_2(self)
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

    async def _inject_test_element(self, tab : str, timeout : int = 3) -> Result:
        attempt = 0
        while True:
            if await self._check_test_element(self, tab):
                return Result(True)
            else:
                try:
                    await inject_to_tab(tab, 
                    f"""
                    (function() {{
                        const elem = document.createElement('div');
                        elem.id = "test_css_loaded";
                        document.head.append(elem);
                    }})()
                    """, False)
                except:
                    pass

                attempt += 1

                if (attempt >= timeout):
                    return Result(False, f"Inject into tab '{tab}' was attempted {timeout} times, stopping")

                await asyncio.sleep(1)
            
    
    async def _check_test_element(self, tab : str) -> bool:
        try:
            return await tab_has_element(tab, "test_css_loaded")
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
                    if not await tab_exists(x):
                        continue # Tab does not exist, so not worth injecting into it

                    # Log(f"Checking if tab {x} is still injected...")
                    if not await self._check_test_element(self, x):
                        Log(f"Tab {x} is not injected, reloading...")
                        await self._inject_test_element(self, x)
                        for y in self.injects:
                            if y.enabled:
                                (await y.inject(x)).raise_on_failure()
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

        Log("Waiting 1s...")
        await asyncio.sleep(1)
        
        Initialized = True

        self.themes = []
        Log("Initializing css loader...")
        Log(f"Max supported manifest version: {CSS_LOADER_VER}")
        
        await create_symlink(f"{get_user_home()}/homebrew/themes", f"{get_user_home()}/.local/share/Steam/steamui/themes_custom")
        self.remote = RemoteInstall()
        await self.remote.load()
        load_tab_mappings()

        await self._load(self)
        await self._inject_test_element(self, "SP", 9999)
        await self._load_stage_2(self, False)

        Log(f"Initialized css loader. Found {len(self.themes)} themes, which inject into {len(self.tabs)} tabs ({self.tabs}). Total {len(self.injects)} injects, {len([x for x in self.injects if x.enabled])} injected")
        await self._check_tabs(self)