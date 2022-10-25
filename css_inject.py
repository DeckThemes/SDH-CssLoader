from typing import List
from css_utils import Result, Log
from css_tab_mapping import get_multiple_tab_mappings, inject_css, remove_css

class Inject:
    def __init__(self, cssPath : str, tabs : List[str], theme):
        self.css = None
        self.cssPath = cssPath
        self.tabs = get_multiple_tab_mappings(tabs)
        self.uuids = {}
        self.theme = theme
        self.enabled = False
        for x in self.tabs:
            self.uuids[x] = []

    async def load(self) -> Result:
        try:
            with open(self.cssPath, "r") as fp:
                self.css = fp.read()

            Log(f"Loaded css at {self.cssPath}")
            self.css = self.css.replace("\\", "\\\\").replace("`", "\\`")

            return Result(True)
        except Exception as e:
            return Result(False, str(e))

    async def inject(self, tab : str = None) -> Result:
        if (tab is None):
            for x in self.tabs:
                await self._inject_internal(x)

            return Result(True)
        else:
            return await self._inject_internal(tab)

    async def _inject_internal(self, tab : str) -> Result:
        if (tab not in self.tabs):
            return Result(True) # this is kind of cheating but
        
        if (len(self.uuids[tab]) > 0):
            await self.remove(tab)
            self.enabled = True # In case the below code fails, it will never be re-injected unless it's still enabled

        if (self.css is None):
            result = await self.load()
            if not result.success:
                return result        

        try:
            res = await inject_css(tab, self.css)
            if not res["success"]:
                return Result(False, str(res["result"]))
            
            Log(f"+{str(res['result'])} @ {tab}")
            self.uuids[tab].append(str(res["result"]))
        except Exception as e:
            return Result(False, str(e))

        self.enabled = True
        return Result(True)

    async def remove(self, tab : str = None) -> Result:
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
                Log(f"-{x} @ {tab}")
                res = await remove_css(tab, x)
                #if not res["success"]:
                #    return Result(False, res["result"])
                # Silently ignore error. If any page gets reloaded, and there was css loaded. this will fail as it will fail to remove the css

            self.uuids[tab] = []
        except Exception as e:
            return Result(False, str(e))

        self.enabled = False
        return Result(True)