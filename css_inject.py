from typing import List
from css_utils import Result, Log
from css_tab_mapping import Tab, get_tabs

class Inject:
    def __init__(self, cssPath : str, tabs : List[str], theme):
        self.css = None
        self.cssPath = cssPath
        self.tabs = get_tabs(tabs)
        self.uuids = {}
        self.theme = theme
        self.enabled = False
        for x in self.tabs:
            self.uuids[x.id] = []

    async def load(self) -> Result:
        try:
            with open(self.cssPath, "r") as fp:
                self.css = fp.read()

            Log(f"Loaded css at {self.cssPath}")
            self.css = self.css.replace("\\", "\\\\").replace("`", "\\`")

            return Result(True)
        except Exception as e:
            return Result(False, str(e))

    async def inject(self, tab : Tab = None) -> Result:
        if (tab is None):
            for x in self.tabs:
                await self._inject_internal(x)

            return Result(True)
        else:
            return await self._inject_internal(tab)

    async def _inject_internal(self, tab : Tab) -> Result:
        if (tab not in self.tabs):
            return Result(True) # this is kind of cheating but
        
        if (len(self.uuids[tab.id]) > 0):
            await self.remove(tab)
            self.enabled = True # In case the below code fails, it will never be re-injected unless it's still enabled

        if (self.css is None):
            result = await self.load()
            if not result.success:
                return result        

        try:
            res = await tab.inject_css(self.css)
            if not res.success:
                return res
            
            Log(f"+{str(res.message)} @ {tab.get_name()}")
            self.uuids[tab.id].append(str(res.message))
        except Exception as e:
            return Result(False, str(e))

        self.enabled = True
        return Result(True)

    async def remove(self, tab : Tab = None) -> Result:
        if (tab is None):
            for x in self.tabs:
                await self.remove(x)

            return Result(True)
        else:
            if (tab not in self.tabs):
                return Result(True) # this is kind of cheating but

        if (len(self.uuids[tab.id]) <= 0):
            return Result(True) # this is kind of cheating but

        try:
            for x in self.uuids[tab.id]:
                Log(f"-{x} @ {tab.get_name()}")
                res = await tab.remove_css(x)
                #if not res["success"]:
                #    return Result(False, res["result"])
                # Silently ignore error. If any page gets reloaded, and there was css loaded. this will fail as it will fail to remove the css

            self.uuids[tab.id] = []
        except Exception as e:
            # TODO: Investigate failure here
            return Result(False, str(e))

        self.enabled = False
        return Result(True)

def to_inject(key : str, tabs : list, basePath : str, theme) -> Inject:
    inject = Inject(basePath + "/" + key, tabs, theme)
    if key.startswith("--"):
        value = tabs[0]
        tabs = tabs[1:]
        if (";" in value or ";" in key):
            raise Exception("Multiple css statements are unsupported in a variable")
        inject = Inject("", tabs, theme)
        inject.css = f":root {{ {key}: {value}; }}"
    
    return inject

def to_injects(items : dict, basePath : str, theme) -> list:
    return [to_inject(x, items[x], basePath, theme) for x in items]