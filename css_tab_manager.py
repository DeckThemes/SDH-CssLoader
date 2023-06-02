import os, re, uuid, asyncio, json, aiohttp
from typing import List
from css_utils import get_theme_path, Log, Result
import injector
import css_inject

CSS_TAB_MAPPINGS = {
    "SP": ["SP|Steam Big Picture Mode", "~Valve Steam Gamepad/default~"],
    "Steam Big Picture Mode": ["SP|Steam Big Picture Mode", "~Valve Steam Gamepad/default~"],
    "MainMenu": ["MainMenu.*", "~valve.steam.gamepadui.mainmenu~"],
    "MainMenu_.*": ["MainMenu.*", "~valve.steam.gamepadui.mainmenu~"],
    "QuickAccess": ["QuickAccess.*", "~valve.steam.gamepadui.quickaccess~"],
    "QuickAccess_.*": ["QuickAccess.*", "~valve.steam.gamepadui.quickaccess~"],
    "Steam": ["SteamLibraryWindow|Steam"],
    "SteamLibraryWindow": ["SteamLibraryWindow|Steam"],
    "All": ["SP|Steam Big Picture Mode", "~Valve Steam Gamepad/default~", "MainMenu.*", "~valve.steam.gamepadui.mainmenu~", "QuickAccess.*", "~valve.steam.gamepadui.quickaccess~"]
}

class CssTab:
    def __init__(self, tab : injector.Tab, open_websocket : bool = True) -> None:
        self.tab = tab
        self.pending_add = {}
        self.pending_remove = []
        if open_websocket:
            asyncio.create_task(self.connect())

    def is_connected(self) -> bool:
        return self.tab.websocket != None and not self.tab.websocket.closed
    
    async def connect(self):
        try:
            await self.tab.open_websocket()
        except Exception as e:
            Result(False, str(e))
            await self.close()

        Log(f"Connected to {self.tab.title}")
        asyncio.create_task(self.continuous_health_check())

    async def close(self):
        if self.is_connected():
            self.tab.close_websocket()
        
        if (self in CONNECTED_TABS):
            Log(f"Disconnected from {self.tab.title}")
            CONNECTED_TABS.remove(self)
        
        self.tab.websocket = None

    def compare(self, tab_name : str) -> bool:
        checks = [tab_name]

        if (tab_name in CSS_TAB_MAPPINGS):
            checks.extend(CSS_TAB_MAPPINGS[tab_name])

        for tab_check in checks:
            if tab_check.startswith("~") and tab_check.endswith("~") and len(tab_check) > 2:
                if tab_check[1:-1] in self.tab.url:
                    return True
            elif re.match(tab_check + "$", self.tab.title):
                return True
        
        return False

    async def force_reinject(self) -> Result:
        if not self.is_connected():
            return Result(True)

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
    
    async def continuous_health_check(self):
        while self.is_connected():
            try:
                await self.health_check()
            except Exception as e:
                Result(False, f"[Health Check on {self.tab.title}] {str(e)}")
            await asyncio.sleep(3)
        
        await self.close()

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
        Log(f"Committing css transaction on {self.tab.title} +{len(pending_add)} -{len(pending_remove)}")

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

BROWSER_CONNECTED = False

async def continuous_polling_health_check():
    global BROWSER_CONNECTED

    while True:
        try:
            await asyncio.sleep(20)

            if not BROWSER_CONNECTED:
                continue

            tabs = await injector.get_tabs()

            for tab in tabs:
                found = False
                for connected_tab in CONNECTED_TABS:
                    if connected_tab.tab.id == tab.id:
                        found = True
                        break
                
                if not found:
                    CONNECTED_TABS.append(CssTab(tab))

        except Exception as e:
           Result(False, f"[Continuous Polling Health Check] {str(e)}")
           await asyncio.sleep(3)       

async def continuous_health_check():
    global BROWSER_CONNECTED

    while True:
        try:
            async with aiohttp.ClientSession() as web:
                res = await web.get(f"{injector.BASE_ADDRESS}/json/version", timeout=3)
            
            if (res.status != 200):
                raise Exception(f"{injector.BASE_ADDRESS}/json/version returned {res.status}")

            data = await res.json()
            url = data["webSocketDebuggerUrl"]

            injector_tab = injector.Tab({
                "id": "Browser",
                "title": "Browser",
                "url": "None",
                "webSocketDebuggerUrl": url
            })

            await injector_tab.open_websocket()
            tab = CssTab(injector_tab, False)
            await asyncio.sleep(3) # Wait a second for good measure
            BROWSER_CONNECTED = True

            await tab.tab._send_devtools_cmd({
                "method": "Target.setDiscoverTargets",
                    "params": {
                    "discover": True
                }
            }, False)

            async for message in tab.tab.listen_for_message():
                if "method" in message and message["method"] in ["Target.targetDestroyed", "Target.targetInfoChanged", "Target.targetCreated"]:
                    if message["method"] == "Target.targetInfoChanged" or message["method"] == "Target.targetCreated":
                        target_info = message["params"]["targetInfo"]

                        if "type" in target_info and target_info["type"] != "page":
                            continue

                        found = False
                        for connected_tab in CONNECTED_TABS:
                            if target_info["targetId"] == connected_tab.tab.id:
                                if (target_info["title"] != connected_tab.tab.title):
                                    connected_tab.tab.title = target_info["title"]
                                    asyncio.create_task(connected_tab.force_reinject())
                                
                                found = True
                                break

                        if found:
                            continue
                        
                        new_tab = injector.Tab({
                            "title": target_info["title"],
                            "id": target_info["targetId"],
                            "url": target_info["url"],
                            "webSocketDebuggerUrl": injector.BASE_ADDRESS.replace("http://", "ws://") + "/devtools/page/" + target_info["targetId"]
                        })

                        CONNECTED_TABS.append(CssTab(new_tab))
                    
                    else:
                        id = message["params"]["targetId"]
                        for connected_tab in CONNECTED_TABS:
                            if connected_tab.tab.id == id:
                                await connected_tab.close()   

        except Exception as e:
            BROWSER_CONNECTED = False
            Result(False, f"[Continuous Health Check] {str(e)}")
            await asyncio.sleep(3)