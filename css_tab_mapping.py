import os
from css_utils import get_theme_path, Log, Result
import injector
import re
from utilities import Utilities
import uuid

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
    
    async def close(self):
        try:
            await self.tab.close_websocket()
        except:
            pass
    
    async def available(self) -> bool:
        res = await self.open()
        await self.close()
        return res.success

    async def inject_css(self, css : str) -> Result:
        res = await self.open()
        if not res.success:
            return res
        
        inject_res = await self.tab.inject_css(css, False)
        await self.close()
        return Result(inject_res["success"], inject_res["result"])
    
    async def remove_css(self, css_id : str) -> Result:
        res = await self.open()
        if not res.success:
            return res
        
        remove_res = await self.tab.remove_css(css_id)
        await self.close()
        return Result(remove_res["success"], remove_res["result"] if remove_res["success"] else "Success")
    
    async def has_element(self, element_name) -> bool:
        res = await self.open()
        if not res.success:
            return False

        res = await self.tab.has_element(element_name)
        await self.close()
        return res
    
    async def evaluate_js(self, js : str, run_async=False) -> Result:
        res = await self.open()
        if not res.success:
            return res

        await self.tab.evaluate_js(js, run_async, False)
        await self.close()
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