import os
from css_inject import Inject, to_inject

SFP_DEFAULT_FILES = {
    "libraryroot.custom.css": ["desktop", "desktopoverlay", "desktopcontextmenu"],
    "bigpicture.custom.css": ["bigpicture", "bigpictureoverlay"],
    "friends.custom.css": ["desktopchat"],
    "webkit.css": ["store"]
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
    theme.injects = [to_inject(x, SFP_DEFAULT_FILES[x], dir, theme) for x in SFP_DEFAULT_FILES if os.path.exists(os.path.join(dir, x))]