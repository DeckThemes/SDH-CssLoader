import os, re, uuid, asyncio, json
from css_utils import get_theme_path, Log, Result
import injector
from utilities import Utilities

pluginManagerUtils = Utilities(None)

def _match_tab(tab, name_mappings: list = [], url_parts : list = []) -> bool:
    for x in url_parts:
        if x in tab.url:
            return True
    
    for x in name_mappings:
        if re.match(x + "$", tab.title) is not None:
            return True
    
    return False

class Tab:
    def __init__(self, name_mappings: list = [], url_parts : list = [], extra_keywords : list = []):
        self.id = str(uuid.uuid4())
        self.tab = None
        self.tab_names_regex = name_mappings
        self.tab_url_parts = url_parts
        self.keywords = extra_keywords
        self.pending_add = {}
        self.pending_remove = []

    async def commit_css_transaction(self, retry : int = 3) -> Result:
        pending_add = self.pending_add
        pending_remove = self.pending_remove

        if len(pending_add) + len(pending_remove) == 0:
            return Result(True)

        self.pending_add = {}
        self.pending_remove = []

        data = {
            "add": [{"id": x, "css": pending_add[x]} for x in pending_add],
            "remove": pending_remove
        }

        data_str = json.dumps(data)

        js = f"""
        (function() {{
            let css_data = {data_str};

            css_data.add.forEach(x => {{
                if (document.getElementById(x.id) !== null){{
                    return;
                }}

                let style = document.createElement('style');
	            style.id = x.id;
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

    def compare(self, name : str) -> bool:
        if name in self.tab_names_regex:
            return True
        
        if name in self.keywords:
            return True
        
        if name == self.get_name():
            return True

        return False
    
    async def connect(self, skip_if_connected : bool = False) -> Result:
        if (self.tab != None and skip_if_connected):
            return Result(True)

        try:
            self.tab = await injector.get_tab_lambda(lambda x : _match_tab(x, self.tab_names_regex, self.tab_url_parts))
            Log(f"Connected to tab {self.get_name()}")
        except Exception as e:
            return Result(False, f"{str(e)} ({self.tab_names_regex})")

        return Result(True)
    
    def get_name(self) -> str | None:
        if self.tab == None:
            return None
        
        return self.tab.title
    
    async def open(self) -> Result:
        try:
            await self.tab.open_websocket() # I realize this can cause an exception if self.tab is null. Intentional bug
        except Exception as e:
            if self.tab != None:
                Result(False, f"Try 1 open on tab failed '{str(e)}'")

            try:
                res = await self.connect()
                if not res.success:
                    return res
                await self.tab.open_websocket()
            except Exception as e:
                return Result(False, str(e))
        
        return Result(True)

    async def manage_webhook(self) -> Result:
        if self.tab == None or self.tab.websocket == None or self.tab.websocket.closed:
            return await self.open()
        
        return Result(True)
    
    async def close_webhook(self):
        try:
            await self.tab.close_websocket()
        except:
            pass
        finally:
            self.tab.websocket = None
    
    async def available(self) -> bool:
        res = await self.manage_webhook()
        
        return res.success

    async def inject_css(self, css : str) -> Result:
        id = str(uuid.uuid4())
        self.pending_add[id] = css
        return Result(True, id)
    
    async def remove_css(self, css_id : str) -> Result:
        if css_id in self.pending_add:
            del self.pending_add[css_id]
        else:
            self.pending_remove.append(css_id)

        return Result(True)
    
    async def has_element(self, element_name) -> bool:
        res = await self.manage_webhook()
        if not res.success:
            return False

        try:
            res = await self.tab.has_element(element_name, False)
        except Exception as e:
            if str(e) == "Cannot write to closing transport": # Hack but closed property seems to not be set
                await self.close_webhook()

            res = False 
            Result(False, str(e))

        return res
    
    async def evaluate_js(self, js : str, run_async=False) -> Result:
        res = await self.manage_webhook()
        if not res.success:
            return res

        try:
            res = await self.tab.evaluate_js(js, run_async, False)

            if res == None:
                raise Exception("No response from eval_js")
        except Exception as e:
            if str(e) == "Cannot write to closing transport": # Hack but closed property seems to not be set
                await self.close_webhook()

            return Result(False, str(e))
            
        #Log(res)
        return Result(True)

def load_tab_mappings():
    global CSS_LOADER_TAB_CACHE
    CSS_LOADER_TAB_CACHE = [
        Tab(["QuickAccess.*"], ["valve.steam.gamepadui.quickaccess"], ["All", "QuickAccess.*", "QuickAccess_.*", "QuickAccess"]),
        Tab(["MainMenu.*"], ["valve.steam.gamepadui.mainmenu"], ["All", "MainMenu", "MainMenu_.*"]),
        Tab(["SP|Steam Big Picture Mode"], ["Valve Steam Gamepad/default"], ["All", "SP", "Steam Big Picture Mode"])
    ]

    tab_mappings_txt_path = os.path.join(get_theme_path(), "mappings.txt")

    if (os.path.exists(tab_mappings_txt_path)):
        with open(tab_mappings_txt_path, "r") as fp:
            for x in fp.readlines():
                x = x.strip()
                if x.startswith("#") or x.startswith("//") or x == "":
                    continue
                try:
                    split = x.split(":")

                    if (len(split) != 2):
                        raise Exception("Invalid mapping entry")
                    
                    tab = get_single_tab(split[0])
                    if tab == None:
                        CSS_LOADER_TAB_CACHE.append(Tab([split[1]], [], split[0]))
                    else:
                        if split[1] not in tab.tab_names_regex:
                            tab.tab_names_regex.append(split[1])
                except Exception as e:
                    Log(f"Failed to read mapping '{x}': {str(e)}")
        
    Log("Mapped Tabs:")
    for x in CSS_LOADER_TAB_CACHE:
        Log(f"{x.keywords} -> {x.tab_names_regex}/{x.tab_url_parts}")

def get_tab(tab_name : str) -> list:
    global CSS_LOADER_TAB_CACHE
    tabs = []

    for x in CSS_LOADER_TAB_CACHE:
        if x.compare(tab_name):
            tabs.append(x)
    
    if len(tabs) <= 0:
        tab = Tab([tab_name])
        tabs.append(tab)
        CSS_LOADER_TAB_CACHE.append(tab)
    
    return tabs

def get_single_tab(tab_name : str) -> Tab | None:
    tabs = get_tab(tab_name)

    if (len(tabs) != 1):
        return None

    return tabs[0]

def get_tabs(tab_names : list):
    tabs = []
    for x in tab_names:
        for y in get_tab(x):
            if y not in tabs:
                tabs.append(y)
    
    return tabs

def get_cached_tabs():
    return CSS_LOADER_TAB_CACHE

async def commit_all():
    for x in get_cached_tabs():
        await x.commit_css_transaction()