import os, json, asyncio
from os import path
from utilities import Utilities
from injector import inject_to_tab, get_tab, tab_has_element
from logging import getLogger, basicConfig, INFO, DEBUG

firstLoad = True

class Plugin: 
    async def getThemes(self):
        return self.injects

    async def setAppliedThemeIds(self, name : str, tab : str, ids : list):
        self.injects[name]["ids"][tab] = ids

    async def setThemeState(self, name : str, state : bool):
        enabledPath = self.injects[name]["path"] + "/ENABLED"
        
        if (state):
            self.injects[name]["active"] = True
            
            if not path.exists(enabledPath):
                open(enabledPath, "a").close()
                
        else:
            self.injects[name]["active"] = False
            self.injects[name]["ids"] = {}
            
            if path.exists(enabledPath):
                os.remove(enabledPath)

    async def reload(self):
        await self._main(self) 
        
    async def inject(self, theme):
        theme["active"] = True
        for x in theme["tabs"]:
            ids = []
            for y in theme["tabs"][x]:
                res = await self.utils.inject_css_into_tab(x, y)
                if (res["success"]): 
                    ids.append(res["result"])

            theme["ids"][x] = ids
            
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
                    for x in self.injects:
                        if (self.injects[x]["active"]):
                            await self.inject(self, self.injects[x])
            except:
                pass
 
    async def _main(self):
        global firstLoad
        if (firstLoad):
            firstLoad = False
            asyncio.get_event_loop().create_task(self.checkIfReady(self))
        
        self.utils = Utilities(None)
        self.injects = {} # TODO: clean up after hot reload
        themedirspath = "/home/deck/homebrew/themes" 

        if (not path.exists(themedirspath)):
            return

        themedirs = [str(x) for x in os.listdir(themedirspath)]

        for x in themedirs:
            xPath = themedirspath + "/" + x

            with open(xPath + "/" + "theme.json", "r") as fp:
                theme = json.load(fp)
            
            themedata = {}
            themedata["name"] = theme["name"]
            themedata["version"] = theme["version"]
            themedata["tabs"] = {}
            themedata["ids"] = {}
            themedata["active"] = False
            themedata["path"] = xPath

            for y in theme["inject"]:
                with open(xPath + "/" + y, "r") as fp: 
                    css = fp.read()
                    
                    for z in theme["inject"][y]:
                        if (z not in themedata["tabs"]):
                            themedata["tabs"][z] = []

                        themedata["tabs"][z].append(css)
 
            enabledPath = xPath + "/ENABLED"
            if path.exists(enabledPath):
                themedata["active"] = True
                
            self.injects[theme["name"]] = themedata
            
if __name__ == "__main__":
    plugin = Plugin()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(plugin._main())
    
    for x in plugin.injects:
        themedata = plugin.injects[x]
        print(f"Found theme {themedata['name']} ({themedata['version']}). Injects into {len(themedata['tabs'])} tabs")