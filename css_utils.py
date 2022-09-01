from logging import getLogger
import os
from os import path

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

    if (os.stat(dirPath).st_uid != 1000):
        os.chown(dirPath, 1000, 1000) # Change to deck user

async def create_symlink(src : str, dst : str) -> Result:
    try:
        if not os.path.exists(dst):
            os.symlink(src, dst, True)
    except Exception as e:
        return Result(False, str(e))

    return Result(True)