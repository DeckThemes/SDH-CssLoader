import os, json, asyncio
from os import path
from utilities import Utilities
from injector import inject_to_tab, get_tab, tab_has_element
from logging import getLogger, basicConfig, INFO, DEBUG

firstLoad = True
pluginManagerUtils = Utilities(None)

class Result:
    def __init__(self, success : bool, message : str = "Success"):
        self.success = success
        self.message = message
    
    def toDict(self):
        return {"success": self.success, "message": self.message}

class Theme:
    def __init__(self, themePath : str, json : dict):
        self.name = json["name"]
        self.version = json["version"]
        self.tabs = {}
        self.css = {}
        self.patches = []
        self.ids = {}
        self.path = themePath
        self.active = path.exists(self.path + "/ENABLED")
        
        for y in json["inject"]:
            if y not in self.css:
                with open(themePath + "/" + y, "r") as fp: 
                    css = fp.read()
                    self.css[y] = css
                    
            for z in json["inject"][y]:
                if (z not in self.tabs):
                    self.tabs[z] = []

                self.tabs[z].append(y)
        
        if "patches" in json:
            for x in json["patches"]:
                self.patches.append(Patch(x, json["patches"][x], self))

    async def inject(self) -> Result:
        if self.active:
            return Result(True)

        self.active = True

        try:
            if not path.exists(self.path + "/ENABLED"):
                open(self.path + "/ENABLED", "a").close()
        except Exception as e:
            return Result(False, str(e))

        self.ids = {}

        for x in self.tabs:
            ids = []
            for y in self.tabs[x]:
                try:
                    res = await pluginManagerUtils.inject_css_into_tab(x, self.css[y])
                    if (res["success"]): 
                        ids.append(res["result"])
                    else:
                        return Result(False, str(res["result"]))
                except Exception as e:
                    return Result(False, str(e))

            if x not in self.ids:
                self.ids[x] = ids
            else:
                self.ids[x].extend(ids)

        for x in self.patches:
            res = await x.inject_additional_css()
            if not res.success:
                return res
        
        return Result(True)

    async def remove(self) -> Result:
        if not self.active:
            return Result(True)

        self.active = False
        
        try:
            if path.exists(self.path + "/ENABLED"):
                os.remove(self.path + "/ENABLED")
        except Exception as e:
            return Result(False, str(e))

        for x in self.ids:
            for y in self.ids[x]:
                try:
                    res = await pluginManagerUtils.remove_css_from_tab(x, y)
                    if not res["success"]:
                        return Result(False, res["result"])
                except Exception as e:
                    return Result(False, str(e))
        
        self.ids = {}

        return Result(True)
    
    def toDict(self) -> dict:
        return {
            "name": self.name,
            "version": self.version,
            "active": self.active,
            "options": [x.toDict() for x in self.patches]
        }

class Patch:
    def __init__(self, name : str, json : dict, theme : Theme):
        self.name = name
        self.default = ""
        self.selectedOption = ""
        self.options = {}
        self.theme = theme

        for x in json: # Possible options
            if x == "default":
                self.default = json[x]
            else:
                if x not in self.options:
                    self.options[x] = {}

                for y in json[x]: # Css files
                    if y not in self.theme.css:
                        with open(self.theme.path + "/" + y, "r") as fp: 
                            css = fp.read()
                            self.theme.css[y] = css

                    for z in json[x][y]: # Target tabs
                        if z not in self.options[x]:
                            self.options[x][z] = []
                        
                        self.options[x][z].append(y)
        
        if self.default == "":
            raise Exception("Patch has no default")

        self.selectedOption = self.default
    
    async def inject_additional_css(self) -> Result:
        for x in self.options[self.selectedOption]:
            ids = []
            for y in self.options[self.selectedOption][x]:
                try:
                    res = await pluginManagerUtils.inject_css_into_tab(x, self.theme.css[y])
                    if (res["success"]): 
                        ids.append(res["result"])
                    else:
                        return Result(False, str(res["result"]))
                except Exception as e:
                    return Result(False, str(e))

            if x not in self.theme.ids:
                self.theme.ids[x] = ids
            else:
                self.theme.ids[x].extend(ids)

        return Result(True)

    def toDict(self) -> dict:
        return {
            "name": self.name,
            "active": self.selectedOption,
            "options": self.options.keys()
        }

class Plugin: 
    async def getThemes(self):
        return [x.toDict() for x in self.themes]
    
    async def inject(self, themeName : str) -> dict:
        for x in self.themes:
            if (x.name == themeName):
                return (await x.inject()).toDict()
        
        return Result(False, "Theme with name not found").toDict()

    async def remove(self, themeName : str) -> dict:
        for x in self.themes:
            if (x.name == themeName):
                return (await x.remove()).toDict()
            
        return Result(False, "Theme with name not found").toDict()

    async def reload(self):
        await self._main(self) 
            
    async def checkIfReady(self):
        finished_reinjection = False
        while True:
            try:
                await asyncio.sleep(1)
                if not await tab_has_element("SP", "test_css_loaded"):
                
                    await inject_to_tab("SP", 
                    f"""
                    (function() {{
                        const elem = document.createElement('div');
                        elem.id = "test_css_loaded";
                        document.head.append(elem);
                    }})()
                    """, False)
            
                    finished_reinjection = True
                    
                elif finished_reinjection:
                    finished_reinjection = False
                    for x in [x for x in self.themes if x.active]:
                        x.active = False
                        await x.inject()
            except:
                pass
 
    async def _main(self):
        global firstLoad
        if (firstLoad):
            firstLoad = False
            asyncio.get_event_loop().create_task(self.checkIfReady(self))

        if hasattr(self, "themes"):
            for x in self.themes:
                await x.remove()

        self.themes = []
        themedirspath = "/home/deck/homebrew/themes" 

        if (not path.exists(themedirspath)):
            return # TODO: maybe copy the default theme dir over?

        themedirs = [str(x) for x in os.listdir(themedirspath)]

        for x in themedirs:
            xPath = themedirspath + "/" + x

            with open(xPath + "/" + "theme.json", "r") as fp:
                theme = json.load(fp)

            themedata = Theme(xPath, theme)
            self.themes.append(themedata)