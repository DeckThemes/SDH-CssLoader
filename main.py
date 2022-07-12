import os, json, asyncio
from time import sleep
from os import geteuid, mkdir, path
from typing import List
from utilities import Utilities
from injector import inject_to_tab, get_tab, tab_has_element
from logging import getLogger, basicConfig, INFO, DEBUG

pluginManagerUtils = Utilities(None)
Initialized = False 

def createDir(dirPath : str):
    if (path.exists(dirPath)):
        return

    os.mkdir(dirPath)

    if (os.stat(dirPath).st_uid != 1000):
        os.chown(dirPath, 1000, 1000) # Change to deck user

class Result:
    def __init__(self, success : bool, message : str = "Success"):
        self.success = success
        self.message = message
    
    def raise_on_failure(self):
        if not self.success:
            raise Exception(self.message)

    def to_dict(self):
        return {"success": self.success, "message": self.message}

class Inject:
    def __init__(self, cssPath : str, tabs : List[str], theme):
        self.css = None
        self.cssPath = cssPath
        self.tabs = tabs
        self.uuids = {}
        self.theme = theme
        self.enabled = False
        for x in self.tabs:
            self.uuids[x] = []

    async def load(self) -> Result:
        self.theme.log("Inject.load")
        try:
            with open(self.cssPath, "r") as fp:
                self.css = fp.read()

            self.theme.log(f"Loaded css at {self.cssPath}")
            self.css = self.css.replace("\\", "\\\\").replace("`", "\\`")

            return Result(True)
        except Exception as e:
            return Result(False, str(e))

    async def inject(self, tab : str = None) -> Result:
        self.theme.log("Inject.inject")
        if (tab is None):
            for x in self.tabs:
                await self.inject(x)

            return Result(True)
        else:
            if (tab not in self.tabs):
                return Result(True) # this is kind of cheating but

        if (len(self.uuids[tab]) > 0):
            await self.remove(tab)

        if (self.css is None):
            result = await self.load()
            if not result.success:
                return result        

        try:
            res = await pluginManagerUtils.inject_css_into_tab(tab, self.css)
            if not res["success"]:
                return Result(False, str(res["result"]))
            
            self.theme.log(f"+{str(res['result'])} @ {tab}")
            self.uuids[tab].append(str(res["result"]))
        except Exception as e:
            return Result(False, str(e))

        self.enabled = True
        return Result(True)

    async def remove(self, tab : str = None) -> Result:
        self.theme.log("Inject.remove")
        if (tab is None):
            for x in self.tabs:
                await self.remove(x)

            return Result(True)
        else:
            if (tab not in self.tabs):
                return Result(True) # this is kind of cheating but

        if (len(self.uuids[tab]) <= 0):
            return Result(True) # this is kind of cheating but

        try:
            for x in self.uuids[tab]:
                self.theme.log(f"-{x} @ {tab}")
                res = await pluginManagerUtils.remove_css_from_tab(tab, x)
                #if not res["success"]:
                #    return Result(False, res["result"])
                # Silently ignore error. If any page gets reloaded, and there was css loaded. this will fail as it will fail to remove the css

            self.uuids[tab] = []
        except Exception as e:
            return Result(False, str(e))

        self.enabled = False
        return Result(True)

class Theme:
    def __init__(self, themePath : str, json : dict, configPath : str = None):
        self.name = json["name"]
        self.version = json["version"] if ("version" in json) else "v1.0"
        self.author = json["author"] if ("author" in json) else ""

        self.patches = []
        self.injects = []

        self.configPath = configPath if (configPath is not None) else themePath
        self.configJsonPath = self.configPath + "/config" + ("_ROOT.json" if os.geteuid() == 0 else "_USER.json")
        self.themePath = themePath

        self.enabled = False
        self.json = json
        self.logobj = None

    def log(self, text : str):
        if self.logobj is not None:
            self.logobj.info(text)
    
    async def load(self) -> Result:
        self.log("Theme.load")
        if "inject" in self.json:
            for x in self.json["inject"]:
                self.injects.append(Inject(self.themePath + "/" + x, self.json["inject"][x], self))
        
        if "patches" in self.json:
            for x in self.json["patches"]:
                patch = ThemePatch(self, self.json["patches"][x], x)
                result = await patch.load()
                if not result.success:
                    return result

                self.patches.append(patch)

        if not path.exists(self.configJsonPath):
            return Result(True)

        try:
            with open(self.configJsonPath, "r") as fp:
                config = json.load(fp)
        except Exception as e:
            return Result(False, str(e))
        
        activate = False

        for x in config:
            if x == "active" and config["active"]:
                activate = True
            else:
                for y in self.patches:
                    if y.name == x:
                        y.value = config[x]
        
        if activate:
            result = await self.inject()
            if not result.success:
                return result
        
        return Result(True)

    async def save(self) -> Result:
        self.log("Theme.save")
        createDir(self.configPath)

        try:
            config = {"active": self.enabled}
            for x in self.patches:
                config[x.name] = x.value
            
            with open(self.configJsonPath, "w") as fp:
                json.dump(config, fp)
        
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def inject(self) -> Result:
        self.log(f"Injecting theme '{self.name}'")
        for x in self.injects:
            result = await x.inject()
            if not result.success:
                return result

        for x in self.patches:
            result = await x.inject()
            if not result.success:
                return result
        
        self.enabled = True
        await self.save()
        return Result(True)
    
    async def remove(self) -> Result:
        self.log("Theme.remove")
        for x in self.get_all_injects():
            result = await x.remove()
            if not result.success:
                return result

        self.enabled = False
        await self.save()
        return Result(True)

    def get_all_injects(self) -> List[Inject]:
        self.log("Theme.get_all_injects")
        injects = []
        injects.extend(self.injects)
        for x in self.patches:
            injects.extend(x.injects)
        
        return injects
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "version": self.version,
            "author": self.author,
            "enabled": self.enabled,
            "patches": [x.to_dict() for x in self.patches]
        }

    
class ThemePatch:
    def __init__(self, theme : Theme, json : dict, name : str):
        self.json = json
        self.name = name
        self.default = json["default"]
        self.theme = theme
        self.value = self.default
        self.injects = []
        self.options = {}
        for x in json:
            if (x == "default"):
                continue

            self.options[x] = []
    
    async def load(self) -> Result:
        self.theme.log("ThemePatch.load")
        for x in self.options:
            for y in self.json[x]:
                inject = Inject(self.theme.themePath + "/" + y, self.json[x][y], self.theme)
                self.injects.append(inject)
                self.options[x].append(inject)
        
        return Result(True)

    async def inject(self) -> Result:
        self.theme.log(f"Injecting patch '{self.name}' of theme '{self.theme.name}'")
        for x in self.options[self.value]:
            self.theme.log(x)
            result = await x.inject()
            self.theme.log(result.message)
            if not result.success:
                return result
        
        return Result(True)

    async def remove(self) -> Result:
        self.theme.log("ThemePatch.remove")
        for x in self.injects:
            result = await x.remove()
            if not result.success:
                return result
        
        return Result(True)
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "default": self.default,
            "value": self.value,
            "options": [x for x in self.options]
        }

class Plugin:
    async def get_themes(self) -> list:
        return [x.to_dict() for x in self.themes]
    
    async def set_theme_state(self, name : str, state : bool) -> dict:
        self.log.info(f"Setting state for {name} to {state}")
        for x in self.themes:
            if (x.name == name):
                result = await x.inject() if state else await x.remove()
                return result.to_dict()
        
        return Result(False, f"Did not find theme {name}").to_dict()

    async def set_patch_of_theme(self, themeName : str, patchName : str, value : str) -> dict:
        theme = None
        for x in self.themes:
            if (x.name == themeName):
                theme = x
                break
        
        if theme is None:
            return Result(False, f"Did not find theme '{themeName}'").to_dict()
        
        themePatch = None
        for x in theme.patches:
            if (x.name == patchName):
                themePatch = x
                break
        
        if themePatch is None:
            return Result(False, f"Did not find patch '{patchName}' for theme '{themeName}'").to_dict()
        
        if (value in themePatch.options):
            themePatch.value = value
        
        if (theme.enabled):
            await themePatch.remove()
            await themePatch.inject()
        
        await theme.save()
        return Result(True).to_dict()
    
    async def reset(self) -> dict:
        for x in self.themes:
            await x.remove()

        await self._load(self)
        await self._load_stage_2(self)
        return Result(True).to_dict()

    async def _inject_test_element(self, tab : str) -> Result:
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


            if not path.exists(themeDataPath):
                continue
        
            self.log.info(f"Analyzing theme {x}")
            
            try:
                with open(themeDataPath, "r") as fp:
                    theme = json.load(fp)
                    
                self.log.info(theme)
                themeData = Theme(themePath, theme, configPath)

                if (themeData.name not in [x.name for x in self.themes]):
                    self.themes.append(themeData)
                    self.log.info(f"Adding theme {themeData.name}")

            except Exception as e:
                self.log.warn(f"Exception while parsing a theme: {e}") # Couldn't properly parse everything

    async def _cache_lists(self):
        self.injects = []
        self.tabs = []

        for x in self.themes:
            x.logobj = self.log
            injects = x.get_all_injects()
            self.injects.extend(injects)
            for y in injects:
                for z in y.tabs:
                    if z not in self.tabs:
                        self.tabs.append(z)

    async def _check_tabs(self):
        while True:
            await asyncio.sleep(5)
            for x in self.tabs:
                try:
                    self.log.info(f"Checking if tab {x} is still injected...")
                    if not await self._check_test_element(self, x):
                        self.log.info(f"Tab {x} is not injected, reloading...")
                        await self._inject_test_element(self, x)
                        for y in self.injects:
                            if y.enabled:
                                (await y.inject(x)).raise_on_failure()
                except Exception as e:
                    self.log.info(f":( {str(e)}")
                    pass

    async def _load(self):
        self.log.info("Loading themes...")
        self.themes = []

        themesPath = "/home/deck/homebrew/themes"
        defaultThemesPath = "/home/deck/homebrew/plugins/SDH-CssLoader/themes"

        if (not path.exists(themesPath)):
            createDir(themesPath)

        await self._parse_themes(self, themesPath)
        if (path.exists(defaultThemesPath)):
            await self._parse_themes(self, defaultThemesPath, themesPath)
    
    async def _load_stage_2(self):
        for x in self.themes:
            self.log.info(f"Loading theme {x.name}")
            res = await x.load()
            if not res.success:
                self.log(res.message)
        
        await self._cache_lists(self)

    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True

        self.log = getLogger("CSS_LOADER")
        self.themes = []
        self.log.info("Hello world!")

        await self._load(self)
        await self._inject_test_element(self, "SP")
        await self._load_stage_2(self)

        await self._check_tabs(self)