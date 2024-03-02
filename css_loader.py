from css_utils import Log, Result, get_theme_path, FLAG_KEEP_DEPENDENCIES, FLAG_PRESET
from css_inject import Inject, ALL_INJECTS
from css_theme import Theme, CSS_LOADER_VER
from css_themepatch import ThemePatch
from css_browserhook import remove_all, commit_all
from css_remoteinstall import upload

from asyncio import sleep
from os import listdir, path, mkdir
import json

class Loader:
    def __init__(self):
        self.busy = False
        self.themes = []
        self.scores = {}
        self.last_load_errors = []

    async def lock(self):
        while self.busy:
            await sleep(.1)
        
        self.busy = True
    
    async def unlock(self):
        self.busy = False

    async def load(self, inject_now : bool = True):
        Log("Loading themes...")
        self.themes : list[Theme] = []

        themesPath = get_theme_path()
        self.last_load_errors = await self._parse_themes(themesPath)

        self.scores = {}
        for x in self.themes:
            await self._set_theme_score(x)
        
        Log(self.scores)
        self.themes.sort(key=lambda d: self.scores[d.name])

        for x in self.themes:
            Log(f"Loading theme {x.name}")
            await x.load(inject_now)
        
        await self._cache_lists()
        self.themes.sort(key=lambda d: d.get_display_name())

    async def set_theme_state(self, name : str, state : bool, set_deps : bool = True, set_deps_value : bool = True) -> Result:
        Log(f"Setting state for {name} to {state}")
        theme = await self._get_theme(name)

        if theme == None:
            return Result(False, f"Did not find theme {name}")

        try:
            if state:
                result = await self._enable_theme(theme, set_deps, set_deps_value)
            else:
                result = await self._disable_theme(theme, FLAG_KEEP_DEPENDENCIES in theme.flags)

            await commit_all()
            return result
        except Exception as e:
            return Result(False, str(e))
    
    async def set_patch_of_theme(self, themeName : str, patchName : str, value : str) -> Result:
        try:
            themePatch = await self._get_patch_of_theme(themeName, patchName)
        except Exception as e:
            return Result(False, str(e))
        
        if (themePatch.value == value):
            return Result(True, "Already injected")

        if (value in themePatch.options):
            themePatch.value = value
        
        if (themePatch.theme.enabled):
            await themePatch.remove()
            await themePatch.inject()
        
        await themePatch.theme.save()
        await commit_all()
        return Result(True)
    
    async def set_component_of_theme_patch(self, themeName : str, patchName : str, componentName : str, value : str) -> Result:
        try:
            themePatch = await self._get_patch_of_theme(themeName, patchName)
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
        return Result(True)

    async def reset(self, silent : bool = False) -> dict:
        await self.lock()
        try:
            if silent:
                await self.load()
                await commit_all(remove_all_first=True)
            else:
                await remove_all()
                await self.load()
                await commit_all()
        except Exception as e:
            await self.unlock()
            Result(False, str(e))

        await self.unlock()
        
        return {
            "fails": self.last_load_errors
        }
    
    async def delete_theme(self, themeName : str) -> Result:
        theme = await self._get_theme(themeName)
                
        if (theme == None):
            return Result(False, f"Could not find theme {themeName}")
        
        result = await theme.delete()
        if not result.success:
            return result.to_dict()
        
        self.themes.remove(theme)
        await self._cache_lists()
        return Result(True)

    async def generate_preset_theme(self, name : str) -> Result:
        try:
            deps = {}

            for x in self.themes:
                if x.enabled and FLAG_PRESET not in x.flags:
                    deps[x.name] = {}
                    for y in x.patches:
                        deps[x.name][y.name] = y.get_value()

            result = await self._generate_preset_theme_internal(name, deps)
            return result
        except Exception as e:
            return Result(False, str(e))
    
    async def generate_preset_theme_from_theme_names(self, name : str, themeNames : list) -> Result:
        try:
            deps = {}

            for x in self.themes:
                if x.name in themeNames and FLAG_PRESET not in x.flags:
                    deps[x.name] = {}
                    for y in x.patches:
                        deps[x.name][y.name] = y.get_value()

            result = await self._generate_preset_theme_internal(name, deps)
            return result
        except Exception as e:
            return Result(False, str(e))  

    async def upload_theme(self, name : str, base_url : str, bearer_token : str) -> Result:
        theme = await self._get_theme(name)

        if theme is None:
            return Result(False, f"Could not find theme {name}")
        
        try:
            return await upload(theme, base_url, bearer_token)
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

                dependency = await self._get_theme(dependency_name)
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

                await self._enable_theme(dependency, set_deps, set_deps_value, ignore_dependencies_next)
        
        result = await theme.inject()
        return result

    async def _disable_theme(self, theme : Theme, keep_dependencies : bool) -> Result:
        if theme is None:
            return Result(False)

        result = await theme.remove()

        if keep_dependencies or not result.success:
            return result

        for dependency_name in theme.dependencies:
            dependency = await self._get_theme(dependency_name)

            if dependency == None:
                continue
        
            used = False

            for x in self.themes:
                if x.enabled and dependency.name in [y for y in x.dependencies]:
                    used = True
                    break

            if not used:
                await self._disable_theme(dependency, False)
        
        return result

    async def _set_theme_score(self, theme : Theme):
        if theme.name not in self.scores:
            self.scores[theme.name] = theme.priority_mod
        
        for x in theme.dependencies:
            dependency = await self._get_theme(x)
            if dependency is not None:
                await self._set_theme_score(dependency)
                self.scores[dependency.name] -= 1

    async def _cache_lists(self):
        ALL_INJECTS.clear()

        for x in self.themes:
            injects = x.get_all_injects()
            ALL_INJECTS.extend(injects)

    async def _get_theme(self, themeName : str) -> Theme | None:
        for x in self.themes:
            if x.name == themeName:
                return x
        
        return None
    
    async def _get_patch_of_theme(self, themeName : str, patchName : str) -> ThemePatch:
        theme = await self._get_theme(themeName)
        
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

    async def _parse_themes(self, themesDir : str, configDir : str = None) -> list[tuple[str, str]]:
        if (configDir is None):
            configDir = themesDir

        possibleThemeDirs = [str(x) for x in listdir(themesDir)]
        fails = []

        for x in possibleThemeDirs:
            themePath = themesDir + "/" + x
            configPath = configDir + "/" + x
            themeDataPath = themePath + "/theme.json"

            if not path.isdir(themePath):
                continue
            
            try:
                theme = None
                if path.exists(themeDataPath):
                    with open(themeDataPath, "r") as fp:
                        theme = json.load(fp)
                    
                themeData = Theme(themePath, theme, configPath)

                theme_names = [x.name for x in self.themes]
                if (themeData.name in theme_names):
                    for x in range(5):
                        new_name =  themeData.name + f"_{x}"
                        if (new_name not in theme_names):
                            themeData.add_prefix(x)
                            break

                if (themeData.name not in theme_names):
                    self.themes.append(themeData)
                    Log(f"Found theme {themeData.name}")

            except Exception as e:
                Result(False, f"Failed parsing '{x}': {e}") # Couldn't properly parse everything
                fails.append((x, str(e)))

        return fails
    
    async def _generate_preset_theme_internal(self, name : str, deps : dict) -> Result:
        display_name = name

        if (display_name.endswith(".profile")):
            display_name = display_name[:-8]

        name = f"{display_name}.profile"
        Log(f"Generating theme preset '{display_name}'...")

        existing_theme = await self._get_theme(name)
        if existing_theme is not None and FLAG_PRESET not in existing_theme.flags:
            return Result(False, f"Theme '{name}' already exists")
        
        if existing_theme is None:
            existing_theme = await self._get_theme(display_name)
            if existing_theme is not None:
                if FLAG_PRESET in existing_theme.flags:
                    name = existing_theme.name
                else:
                    return Result(False, f"Theme '{display_name}' already exists")
                
        theme_path = path.join(get_theme_path(), name)

        if not path.exists(theme_path):
            mkdir(theme_path)
        
        with open(path.join(theme_path, "theme.json"), "w") as fp:
            json.dump({
                "display_name": display_name,
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