import json
import re
import os
import aiohttp
import asyncio
from typing import List
from css_utils import Result, Log, store_read, get_theme_path
from css_browserhook import BrowserTabHook as CssTab, inject, remove

CLASS_MAPPINGS = {}

def initialize_class_mappings():
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")

    if not os.path.exists(css_translations_path):
        Log("Failed to get css translations from local file")
        return

    try:
        with open(css_translations_path, "r", encoding="utf-8") as fp:
            data : dict = json.load(fp)
    except Exception as e:
        Log(f"Failed to load css translations from local file: {str(e)}")
        return

    CLASS_MAPPINGS.clear()

    # Data is in the format of { "uid": ["ver1", "ver2", "ver3"]}
    for uid in data:
        latest_value = data[uid][-1]
        for y in data[uid][:-1]:
            CLASS_MAPPINGS[y] = latest_value

    Log(f"Loaded {len(CLASS_MAPPINGS)} css translations from local file")

ALL_INJECTS = []

def helper_get_tab_from_list(tab_list : List[str], cssTab : CssTab) -> str|None:
    for x in tab_list:
        if cssTab.compare(x):
            return x

    return None

class Inject:
    def __init__(self, cssPath : str, tabs : List[str], theme):
        self.css = None
        self.cssPath = cssPath
        self.tabs = tabs
        self.uuids = {}
        self.theme = theme
        self.enabled = False
        for x in self.tabs:
            self.uuids[x] = []

    async def load(self) -> Result:
        try:
            with open(self.cssPath, "r") as fp:
                self.css = fp.read()

            split_css = re.split(r"(\.[_a-zA-Z]+[_a-zA-Z0-9-]*)", self.css)

            for x in range(len(split_css)):
                if split_css[x].startswith(".") and split_css[x][1:] in CLASS_MAPPINGS:
                    split_css[x] = "." + CLASS_MAPPINGS[split_css[x][1:]]

            self.css = ("".join(split_css)).replace("\\", "\\\\").replace("`", "\\`")

            split_css = re.split(r"(\[class[*^|~]=\"[_a-zA-Z0-9-]*\"\])", self.css)

            for x in range(len(split_css)):
                if split_css[x].startswith("[class") and split_css[x].endswith("\"]") and split_css[x][9:-2] in CLASS_MAPPINGS:
                    split_css[x] = split_css[x][0:9] + CLASS_MAPPINGS[split_css[x][9:-2]] + split_css[x][-2:]

            self.css = ("".join(split_css)).replace("\\", "\\\\").replace("`", "\\`")
            Log(f"Loaded css at {self.cssPath}")

            return Result(True)
        except Exception as e:
            return Result(False, str(e))

    async def inject(self) -> Result:
        for tab_name in self.tabs:
            for uuid in self.uuids[tab_name]:
                res = await remove(tab_name, uuid)

            if (self.css is None):
                result = await self.load()
                if not result.success:
                    return result        

            try:
                res = await inject(tab_name, self.css)
                if not res.success:
                    return res

                # Log(f"+{str(res.message)} @ {tab_name}")
                self.uuids[tab_name].append(str(res.message))
            except Exception as e:
                return Result(False, str(e))

        self.enabled = True
        return Result(True)
    
    async def inject_with_tab(self, tab : CssTab) -> Result:
        tab_name = helper_get_tab_from_list(self.tabs, tab)

        if tab_name == None:
            return
        
        if (self.css is None):
            result = await self.load()
            if not result.success:
                return result

        try:
            res = await tab.inject_css(self.css)
            if not res.success:
                return res

            # Log(f"+{str(res.message)} @ {tab_name}")
            self.uuids[tab_name].append(str(res.message))
        except Exception as e:
            return Result(False, str(e))    
        
        return Result(True)

    async def remove(self) -> Result:
        for tab_name in self.tabs:
            if (len(self.uuids[tab_name]) <= 0):
                return Result(True) # this is kind of cheating but

            try:
                for x in self.uuids[tab_name]:
                    res = await remove(tab_name, x)
                    #if not res["success"]:
                    #    return Result(False, res["result"])
                    # Silently ignore error. If any page gets reloaded, and there was css loaded. this will fail as it will fail to remove the css

                self.uuids[tab_name] = []
            except Exception as e:
                return Result(False, str(e))

        self.enabled = False
        return Result(True)

DEFAULT_MAPPINGS = {
    "desktop": ["Steam|SteamLibraryWindow"],
    "desktopchat": ["!friendsui-container"],
    "desktoppopup": ["OverlayBrowser_Browser", "SP Overlay:.*", "notificationtoasts_.*", "SteamBrowser_Find", "OverlayTab\\d+_Find", "!ModalDialogPopup", "!FullModalOverlay"],
    "desktopoverlay": ["desktoppopup"],
    "desktopcontextmenu": [".*Menu", ".*Supernav"],
    "bigpicture": ["~Valve Steam Gamepad/default~", "~Valve%20Steam%20Gamepad~"],
    "bigpictureoverlay": ["QuickAccess", "MainMenu"],
    "store": ["~https://store.steampowered.com~", "~https://steamcommunity.com~"],

    # Legacy
    "SP": ["bigpicture"],
    "Steam Big Picture Mode": ["bigpicture"],
    "MainMenu": ["MainMenu.*"],
    "MainMenu_.*": ["MainMenu"],
    "QuickAccess": ["QuickAccess.*"],
    "QuickAccess_.*": ["QuickAccess"],
    "Steam": ["desktop"],
    "SteamLibraryWindow": ["desktop"],
    "All": ["bigpicture", "bigpictureoverlay"]
}

def extend_tabs(tabs : list, theme) -> list:
    new_tabs = []

    if len(tabs) <= 0:
        return extend_tabs(theme.tab_mappings["default"], theme) if ("default" in theme.tab_mappings) else []

    for x in tabs:
        if x in theme.tab_mappings:
            new_tabs.extend(extend_tabs(theme.tab_mappings[x], theme))
        elif x in DEFAULT_MAPPINGS:
            new_tabs.extend(extend_tabs(DEFAULT_MAPPINGS[x], theme))
        else:
            new_tabs.append(x)

    return new_tabs

def to_inject(key : str, tabs : list, basePath : str, theme) -> Inject:
    if key.startswith("--"):
        value = tabs[0]
        inject = Inject("", extend_tabs(tabs[1:], theme), theme)
        inject.css = f":root {{ {key}: {value}; }}"
    else:
        inject = Inject(basePath + "/" + key, extend_tabs(tabs, theme), theme)
    
    return inject

def to_injects(items : dict, basePath : str, theme) -> list:
    return [to_inject(x, items[x], basePath, theme) for x in items]