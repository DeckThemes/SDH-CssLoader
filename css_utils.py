from logging import getLogger
import os
from os import path
from helpers import get_user
import pwd

Logger = getLogger("CSS_LOADER")

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
    if (path.exists(dirPath)):
        return

    os.mkdir(dirPath)

    a = pwd.getpwnam(get_user())
    uid = a.pw_uid
    gid = a.pw_gid

    if (os.stat(dirPath).st_uid != uid):
        os.chown(dirPath, uid, gid) # Change to deck user

def get_user_home() -> str:
    return f"/home/{get_user()}"

def get_theme_path() -> str:
    return f"{get_user_home()}/homebrew/themes"

async def create_symlink(src : str, dst : str) -> Result:
    try:
        if not os.path.exists(dst):
            os.symlink(src, dst, True)
    except Exception as e:
        return Result(False, str(e))

    return Result(True)