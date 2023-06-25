import os
from css_inject import Inject

SFP_DEFAULT_FILES = {
    "libraryroot.custom.css": ["^Steam.*", "^OverlayBrowser_Browser", "^SP Overlay:.*", ".*Menu", ".*Supernav", "^notificationtoasts_.*", "^SteamBrowser_Find", "^OverlayTab\\d+_Find", "^Properties.*", "!ModalDialogPopup", "!FullModalOverlay"],
    "bigpicture.custom.css": ["^QuickAccess_.*", "^MainMenu_.*", "^Steam Big Picture Mode"],
    "friends.custom.css": ["!friendsui-container"],
    "webkit.css": ["~https://store.steampowered.com~", "~https://steamcommunity.com~"]
}

def is_folder_sfp_theme(dir : str) -> bool:
    for x in SFP_DEFAULT_FILES:
        if os.path.exists(os.path.join(dir, x)):
            return True
        
    return False

def convert_to_css_theme(dir : str, theme) -> None:
    theme.name = os.path.basename(dir)
    theme.id = theme.name
    theme.version = "v1.0"
    theme.author = ""
    theme.require = 1
    theme.dependencies = []
    theme.injects = [Inject(os.path.join(dir, x), SFP_DEFAULT_FILES[x], theme) for x in SFP_DEFAULT_FILES if os.path.exists(os.path.join(dir, x))]