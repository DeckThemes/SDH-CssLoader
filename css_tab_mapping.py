import os
from css_utils import get_theme_path, Log

def load_tab_mappings():
    global TAB_MAPPINGS_INTERNAL
    TAB_MAPPINGS_INTERNAL = {
        "QuickAccess": ["QuickAccess", "QuickAccess_uid2"],
        "MainMenu": ["MainMenu", "MainMenu_uid2"],
        "All": ["SP", "QuickAccess", "QuickAccess_uid2", "MainMenu", "MainMenu_uid2"]
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