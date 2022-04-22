import os, json, asyncio
from os import path

class Plugin: 
    async def getThemes(self):
        return self.injects

    async def setAppliedThemeIds(self, name : str, tab : str, ids : list):
        self.injects[name]["ids"][tab] = ids

    async def setThemeState(self, name : str, state : bool):
        if (state):
            self.injects[name]["active"] = True
        else:
            self.injects[name]["active"] = False
            self.injects[name]["ids"] = {}

    async def _main(self):
        # TODO: load on boot
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

            for y in theme["inject"]:
                with open(xPath + "/" + y, "r") as fp: 
                    css = fp.read()
                    
                    for z in theme["inject"][y]:
                        if (z not in themedata["tabs"]):
                            themedata["tabs"][z] = []

                        themedata["tabs"][z].append(css)

            self.injects[theme["name"]] = themedata
            
if __name__ == "__main__":
    plugin = Plugin()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(plugin._main())
    
    for x in plugin.injects:
        themedata = plugin.injects[x]
        print(f"Found theme {themedata['name']} ({themedata['version']}). Injects into {len(themedata['tabs'])} tabs")