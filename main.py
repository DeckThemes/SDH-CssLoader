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
        self.ids = {}
        self.path = themePath
        self.active = path.exists(self.path + "/ENABLED")
        
        for y in json["inject"]:
            with open(themePath + "/" + y, "r") as fp: 
                css = fp.read()
                    
                for z in json["inject"][y]:
                    if (z not in self.tabs):
                        self.tabs[z] = []

                    self.tabs[z].append(css)

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
                    res = await pluginManagerUtils.inject_css_into_tab(x, y)
                    if (res["success"]): 
                        ids.append(res["result"])
                    else:
                        return Result(False, str(res["result"]))
                except Exception as e:
                    return Result(False, str(e))

            self.ids[x] = ids
        
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