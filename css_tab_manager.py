import os, re, uuid, asyncio, json
from typing import List
from css_utils import get_theme_path, Log, Result
import injector
import css_inject

class CssTab:
    def __init__(self, tab : injector.Tab) -> None:
        self.tab = tab
        self.pending_add = {}
        self.pending_remove = []
        Log(f"Connected to {tab.title}")

    def is_connected(self) -> bool:
        return self.tab.websocket != None and not self.tab.websocket.closed
    
    async def close(self):
        if self.is_connected():
            self.tab.close_websocket()
        
        CONNECTED_TABS.remove(self)

    def compare(self, tab_name : str) -> bool:
        checks = [tab_name]

        # TODO: Clean this up
        if (tab_name in ["All", "SP", "Steam Big Picture Mode"]):
            checks.extend(["SP|Steam Big Picture Mode", "~Valve Steam Gamepad/default~"])

        if (tab_name in ["All", "MainMenu", "MainMenu_.*"]):
            checks.extend(["MainMenu.*", "~valve.steam.gamepadui.mainmenu~"])

        if (tab_name in ["All", "QuickAccess.*", "QuickAccess_.*", "QuickAccess"]):
            checks.extend(["QuickAccess.*", "~valve.steam.gamepadui.quickaccess~"])

        if (tab_name in ["SteamLibraryWindow|Steam", "Steam", "SteamLibraryWindow", "All"]):
            checks.extend(["SteamLibraryWindow|Steam"])

        for tab_check in checks:
            if tab_check.startswith("~") and tab_check.endswith("~") and len(tab_check) > 2:
                if tab_check[1:-1] in self.tab.ws_url:
                    return True
            elif re.match(tab_check + "$", self.tab.title):
                return True
        
        return False

    async def force_reinject(self) -> Result:
        await self.remove_all_css()

        for inject in css_inject.ALL_INJECTS:
            if inject.enabled:
                for x in inject.tabs:
                    if self.compare(x):
                        await inject.inject_with_tab(self)
                        break

        await self.commit_css_transaction()

    async def health_check(self) -> Result:
        if not self.is_connected():
            await self.close()
            return Result(True)

        try:
            if not await self.has_element("test_css_loaded"):
                await self.evaluate_js(
                    f"""
                    (function() {{
                        const elem = document.createElement('div');
                        elem.id = "test_css_loaded";
                        document.head.append(elem);
                    }})()
                    """) 
                
                if not await self.has_element("test_css_loaded"):
                    raise Exception("a variable was injected but cannot be found when retrieved")
                
                await self.force_reinject()

        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def evaluate_js(self, js : str, run_async=False) -> Result:
        try:
            res = await self.tab.evaluate_js(js, run_async, False)

            if res == None:
                raise Exception("No response from eval_js")
        except Exception as e:
            if str(e) == "Cannot write to closing transport": # Hack but closed property seems to not be set
                await self.close()

            return Result(False, str(e))
            
        return Result(True)
    
    async def has_element(self, element_name) -> bool:
        try:
            res = await self.tab.has_element(element_name, False)
        except Exception as e:
            if str(e) == "Cannot write to closing transport": # Hack but closed property seems to not be set
                await self.close()

            res = False 
            Result(False, str(e))

        return res
    
    async def inject_css(self, css : str, id : str = None) -> Result:
        if id == None:
            id = str(uuid.uuid4())

        self.pending_add[id] = css
        return Result(True, id)
    
    async def remove_css(self, css_id : str) -> Result:
        if css_id in self.pending_add:
            del self.pending_add[css_id]
        else:
            self.pending_remove.append(css_id)

        return Result(True)

    async def commit_css_transaction(self, retry : int = 3) -> Result:
        pending_add = self.pending_add
        pending_remove = self.pending_remove

        if len(pending_add) + len(pending_remove) == 0:
            return Result(True)

        self.pending_add = {}
        self.pending_remove = []
        Log(f"Committing css transaction on {self.tab.title} +{len(self.pending_add)} -{len(self.pending_remove)}")

        data = {
            "add": [{"id": x, "css": pending_add[x]} for x in pending_add],
            "remove": pending_remove
        }

        try:
            data_str = json.dumps(data)
        except Exception as e:
            Result(False, str(e))

        js = f"""
        (function() {{
            let css_data = {data_str};

            css_data.add.forEach(x => {{
                if (document.getElementById(x.id) !== null){{
                    return;
                }}

                let style = document.createElement('style');
	            style.id = x.id;
                style.classList.add('css-loader-style');
	            document.head.append(style);
	            style.textContent = x.css;
            }});
            
            css_data.remove.forEach(x => {{
                let style = document.getElementById(x);
                style?.parentNode.removeChild(style);
            }});
        }})()
        """


        while (retry > 0):
            retry -= 1
            res = await self.evaluate_js(js)
            if res.success:
                return res
            else:
                Log("Transaction failed! retrying in 0.2 seconds")
                await asyncio.sleep(0.2)

        return Result(False, "Css Commit Retry Count Exceeded")
    
    async def remove_all_css(self, retry : int = 3) -> Result:
        js = """
        (function() {
            document.querySelectorAll('.css-loader-style').forEach(x => x.remove());
        })()
        """

        self.pending_add = {}
        self.pending_remove = []

        while (retry > 0):
            retry -= 1
            res = await self.evaluate_js(js)
            if res.success:
                return res
            else:
                Log("Transaction failed! retrying in 0.2 seconds")
                await asyncio.sleep(0.2)

        return Result(False, "Css Commit Retry Count Exceeded")

CONNECTED_TABS : List[CssTab] = []

def get_tabs(tab_name : str) -> List[CssTab]:
    tabs = []

    for tab in CONNECTED_TABS:
        if tab.compare(tab_name):
            tabs.append(tab)
    
    return tabs

async def inject(tab_name : str, css : str) -> Result:
    id = str(uuid.uuid4())
    for tab in get_tabs(tab_name):
        await tab.inject_css(css, id)
    
    return Result(True, id)

async def remove(tab_name : str, css_id : str) -> Result:
    for tab in get_tabs(tab_name):
        await tab.remove_css(css_id)
    
    return Result(True)

async def commit_all():
    await asyncio.gather(*[x.commit_css_transaction() for x in CONNECTED_TABS if x.is_connected()])

async def remove_all():
    await asyncio.gather(*[x.remove_all_css() for x in CONNECTED_TABS if x.is_connected()])

async def _internal_new_tab(tab : injector.Tab):
    try:
        await tab.open_websocket()
    except Exception as e:
        Result(False, str(e))
        return

    CONNECTED_TABS.append(CssTab(tab))

async def continuous_health_check():
    while True:
        await asyncio.sleep(3)
        try:
            all_tabs = await injector.get_tabs()
            new_tabs = []

            for tab in all_tabs:
                found = False
                for connected_tab in CONNECTED_TABS:
                    if connected_tab.tab.id == tab.id:
                        found = True

                        if connected_tab.tab.title != tab.title:
                            await connected_tab.force_reinject()
                        
                if not found:
                    new_tabs.append(tab)

            if len(new_tabs) > 0:
                await asyncio.gather(*[_internal_new_tab(new_tab) for new_tab in new_tabs])

            if len(CONNECTED_TABS) > 0:
                await asyncio.gather(*[tab.health_check() for tab in CONNECTED_TABS])
        
        except Exception as e:
            Result(False, str(e))