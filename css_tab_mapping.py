import os
from css_utils import get_theme_path, Log
import injector
import re
from utilities import Utilities

pluginManagerUtils = Utilities(None)

def load_tab_mappings():
    global TAB_MAPPINGS_INTERNAL
    TAB_MAPPINGS_INTERNAL = {
        "QuickAccess": ["QuickAccess", "QuickAccess.*"],
        "MainMenu": ["MainMenu", "MainMenu.*"],
        "All": ["SP", "QuickAccess", "QuickAccess.*", "MainMenu", "MainMenu.*"]
    }

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
                    
                    if split[0] not in TAB_MAPPINGS_INTERNAL:
                        TAB_MAPPINGS_INTERNAL[split[0]] = []

                    if split[1] not in TAB_MAPPINGS_INTERNAL[split[0]]:
                        TAB_MAPPINGS_INTERNAL[split[0]].append(split[1])
                except Exception as e:
                    Log(f"Failed to read mapping '{x}': {str(e)}")
        
    Log("Mappings:")
    for x in TAB_MAPPINGS_INTERNAL:
        Log(f"{x} -> {TAB_MAPPINGS_INTERNAL[x]}")

def get_tab_mappings(tab : str) -> list:
    if tab in TAB_MAPPINGS_INTERNAL:
        return TAB_MAPPINGS_INTERNAL[tab]
    
    return [tab]

def get_multiple_tab_mappings(tabs : list) -> list:
    final_tabs = []
    for x in tabs:
        for y in get_tab_mappings(x):
            if y not in final_tabs:
                final_tabs.append(y)
    return final_tabs


def check_decky_compat() -> bool:
    '''True if using new decky, false if using old decky'''
    return hasattr(injector, "get_tab_lambda")

async def get_tab(tab_name : str):
    if (check_decky_compat()):
        return await injector.get_tab_lambda(lambda x : x.title == tab_name or re.match(tab_name, x.title) is not None)
    else:
        return await injector.get_tab(tab_name)

async def inject_css(tab_name : str, css : str) -> dict:
    if (check_decky_compat()):
        tab = await get_tab(tab_name)
        return await tab.inject_css(css)
    else:
        return await pluginManagerUtils.inject_css_into_tab(tab_name, css)

async def remove_css(tab_name : str, css_id : str) -> dict:
    if (check_decky_compat()):
        tab = await get_tab(tab_name)
        return await tab.remove_css(css_id)
    else:
        return await pluginManagerUtils.remove_css_from_tab(tab_name, css_id)

async def tab_has_element(tab_name : str, element_name : str) -> bool:
    if (check_decky_compat()):
        tab = await get_tab(tab_name)
        return await tab.has_element(element_name)
    else:
        return await injector.tab_has_element(tab_name, element_name)

async def tab_exists(tab_name : str) -> bool:
    try:
        return (await get_tab(tab_name)) is not None
    except:
        return False