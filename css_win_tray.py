import pystray, css_theme, css_utils, os, webbrowser, subprocess
from PIL import Image, ImageDraw

ICON = None
MAIN = None
LOOP = None
DEV_MODE_STATE = False

def reset():
    LOOP.create_task(MAIN.reset(MAIN))

def open_theme_dir():
    theme_dir = css_utils.get_theme_path()
    os.startfile(theme_dir)

def exit():
    LOOP.create_task(MAIN.exit(MAIN))

def get_dev_mode_state(x) -> bool:
    return DEV_MODE_STATE

def toggle_dev_mode_state():
    global DEV_MODE_STATE
    DEV_MODE_STATE = not DEV_MODE_STATE
    LOOP.create_task(MAIN.toggle_watch_state(MAIN, get_dev_mode_state(None)))

def check_if_symlink_exists():
    return os.path.exists(os.path.join(css_utils.get_steam_path(), "steamui", "themes_custom"))

def open_install_docs():
    webbrowser.open_new_tab("https://docs.deckthemes.com/CSSLoader/Install/#windows")

def get_desktop_install_path() -> str|None:
    if os.path.exists("C:/Program Files/CSSLoader Desktop/CSSLoader Desktop.exe"):
        return "C:/Program Files/CSSLoader Desktop/CSSLoader Desktop.exe"
    
    return None

def open_desktop():
    path = get_desktop_install_path()
    if path != None:
        subprocess.Popen([path])

def start_icon(main, loop):
    global ICON, MAIN, LOOP, DEV_MODE_STATE
    MAIN = main
    LOOP = loop
    DEV_MODE_STATE = MAIN.observer != None
    symlink = check_if_symlink_exists()

    ICON = pystray.Icon(
    'CSS Loader',
    title='CSS Loader',
    icon=Image.open(os.path.join(os.path.dirname(__file__), "assets", "paint-roller-solid.png")),
    menu=pystray.Menu(
        pystray.MenuItem(f"CSS Loader v{css_theme.CSS_LOADER_VER}", action=None, enabled=False),
        pystray.MenuItem("Local Images/Fonts: Enabled" if symlink else "Local Images/Fonts: Disabled", action=None, enabled=None),
        pystray.MenuItem("Please enable Windows Developer Mode", action=open_install_docs, visible=not symlink),
        pystray.MenuItem("Open Desktop App", action=open_desktop, enabled=get_desktop_install_path() != None, default=True),
        pystray.MenuItem("Live CSS Editing", toggle_dev_mode_state, checked=get_dev_mode_state),
        pystray.MenuItem("Open Themes Folder", open_theme_dir),
        pystray.MenuItem("Reload Themes", reset),
        pystray.MenuItem("Exit", exit)
    ))
    ICON.run_detached()

def stop_icon():
    if ICON != None:
        ICON.stop()