from logging import getLogger
import os, platform, traceback

HOME = os.getenv("HOME")

if not HOME:
    HOME = os.path.expanduser("~")

USER = os.getenv("USER", "user") # USER is just used for config name

DECKY_HOME = os.getenv("DECKY_HOME", os.path.join(HOME, "homebrew"))
DECKY_USER = os.getenv("DECKY_USER")

if not DECKY_USER:
    DECKY_USER = os.getlogin()

if not os.path.exists(DECKY_HOME):
    os.mkdir(DECKY_HOME)

PLATFORM_WIN = platform.system() == "Windows"

if not PLATFORM_WIN:
    import pwd

Logger = getLogger("CSS_LOADER")

FLAG_KEEP_DEPENDENCIES = "KEEP_DEPENDENCIES"
FLAG_PRESET = "PRESET"

def Log(text : str):
    Logger.info(f"[CSS_Loader] {text}")

class Result:
    def __init__(self, success : bool, message : str = "Success", log : bool = True):
        self.success = success
        self.message = message

        stack = traceback.extract_stack()
        function_above = stack[-2]

        if log and not self.success:
            Log(f"[FAIL] [{os.path.basename(function_above.filename)}:{function_above.lineno}] {message}")
    
    def raise_on_failure(self):
        if not self.success:
            raise Exception(self.message)

    def to_dict(self):
        return {"success": self.success, "message": self.message}

def create_dir(dirPath : str):
    if (os.path.exists(dirPath)):
        return

    os.mkdir(dirPath)

    if not PLATFORM_WIN:
        a = pwd.getpwnam(DECKY_USER)
        uid = a.pw_uid
        gid = a.pw_gid

        if (os.stat(dirPath).st_uid != uid):
            os.chown(dirPath, uid, gid) # Change to deck user

def get_user_home() -> str:
    return HOME

def get_theme_path() -> str:
    path = os.path.join(DECKY_HOME, "themes")

    if not os.path.exists(path):
        create_dir(path)

    return path

def create_symlink(src : str, dst : str) -> Result:
    try:
        if not os.path.exists(dst):
            os.symlink(src, dst, True)
    except Exception as e:
        return Result(False, str(e))

    return Result(True)

def get_steam_path() -> str:
    if PLATFORM_WIN:
        try:
            import winreg
            conn = winreg.ConnectRegistry(None, winreg.HKEY_LOCAL_MACHINE)
            key = winreg.OpenKey(conn, "SOFTWARE\\Wow6432Node\\Valve\\Steam")
            val, type = winreg.QueryValueEx(key, "InstallPath")
            if type != winreg.REG_SZ:
                raise Exception(f"Expected type {winreg.REG_SZ}, got {type}")
            
            Log(f"Got win steam install path: '{val}'")
            return val
        except Exception as e:
            return "C:\\Program Files (x86)\\Steam" # Taking a guess here
    else:
        return f"{get_user_home()}/.steam/steam"

def is_steam_beta_active() -> bool:
    beta_path = os.path.join(get_steam_path(), "package", "beta")
    if not os.path.exists(beta_path):
        return False

    with open(beta_path, 'r') as fp:
        content = fp.read().strip()

    stable_branches = [
        "steamdeck_stable",
    ]

    return content not in stable_branches

def create_steam_symlink() -> Result:
    return create_symlink(get_theme_path(), os.path.join(get_steam_path(), "steamui", "themes_custom"))

def create_cef_flag() -> Result:
    path = os.path.join(get_steam_path(), ".cef-enable-remote-debugging")
    if not os.path.exists(path):
        with open(path, 'w') as fp:
            pass

def store_path() -> str:
    return os.path.join(get_theme_path(), "STORE")

def store_reads() -> dict:
    path = store_path()
    items = {}

    if not os.path.exists(path):
        return items

    with open(path, 'r') as fp:
        for x in fp.readlines():
            c = x.strip()
            if (c == ""):
                continue

            split = c.split(":", 1)

            if (len(split) <= 1):
                continue

            items[split[0]] = split[1]
    
    return items

def store_read(key : str) -> str:
    items = store_reads()
    return items[key] if key in items else ""

def store_write(key : str, val : str):
    path = store_path()
    items = store_reads()
    items[key] = val.replace('\n', '')
    with open(path, 'w') as fp:
        fp.write("\n".join([f"{x}:{items[x]}" for x in items]))
    
def store_or_file_config(key : str) -> bool:
    if os.path.exists(os.path.join(get_theme_path(), key.upper())):
        return True
    
    read = store_read(key)
    return read == "True" or read == "1"