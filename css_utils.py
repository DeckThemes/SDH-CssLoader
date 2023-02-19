from logging import getLogger
import os, platform

HOME = os.environ["HOME"]
USER = os.environ["USER"]
DECKY_USER = os.environ["DECKY_USER"]
DECKY_HOME = os.environ["DECKY_HOME"]
PLATFORM_WIN = platform.system() == "Windows"

if not PLATFORM_WIN:
    import pwd

Logger = getLogger("CSS_LOADER")

FLAG_KEEP_DEPENDENCIES = "KEEP_DEPENDENCIES"
FLAG_PRESET = "PRESET"


def Log(text : str):
    Logger.info(f"[CSS_Loader] {text}")

class Result:
    def __init__(self, success : bool, message : str = "Success"):
        self.success = success
        self.message = message

        if not self.success:
            Log(f"Result failed! {message}")
    
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
    return os.path.join(DECKY_HOME, "themes")

async def create_symlink(src : str, dst : str) -> Result:
    try:
        if not os.path.exists(dst):
            os.symlink(src, dst, True)
    except Exception as e:
        return Result(False, str(e))

    return Result(True)

async def create_steam_symlink() -> Result:
    if PLATFORM_WIN:
        try:
            import winreg
            conn = winreg.ConnectRegistry(None, winreg.HKEY_LOCAL_MACHINE)
            key = winreg.OpenKey(conn, "SOFTWARE\\Wow6432Node\\Valve\\Steam")
            val, type = winreg.QueryValueEx(key, "InstallPath")
            if type != winreg.REG_SZ:
                raise Exception(f"Expected type {winreg.REG_SZ}, got {type}")
            
            Log(f"Got win steam install path: '{val}'")
            return await create_symlink(get_theme_path(), os.path.join(val, "steamui", "themes_custom"))
        except Exception as e:
            return Result(False, str(e))
    else:
        return await create_symlink(get_theme_path(), f"{get_user_home()}/.local/share/Steam/steamui/themes_custom")

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