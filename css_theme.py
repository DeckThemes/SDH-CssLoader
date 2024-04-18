import os, json, shutil, time
from os import path
from typing import List
from css_inject import Inject, to_injects
from css_utils import Result, Log, create_dir, USER
from css_themepatch import ThemePatch
from css_sfp_compat import is_folder_sfp_theme, convert_to_css_theme

CSS_LOADER_VER = 9

class Theme:
    def __init__(self, themePath : str, json : dict, configPath : str = None):
        self.configPath = configPath if (configPath is not None) else themePath
        self.display_name = None
        self.configJsonPath = self.configPath + "/config" + ("_ROOT.json" if USER == "root" else "_USER.json")
        self.patches = []
        self.injects = []
        self.tab_mappings = {}
        self.flags = []
        self.themePath = themePath
        self.bundled = self.configPath != self.themePath
        self.enabled = False
        self.json = json
        self.priority_mod = 0
        self.created = None
        self.modified = path.getmtime(self.configJsonPath) if path.exists(self.configJsonPath) else None

        try:
            if os.path.exists(os.path.join(themePath, "PRIORITY")):
                with open(os.path.join(themePath, "PRIORITY")) as fp:
                    self.priority_mod = int(fp.readline().strip())
        except:
            pass
        
        if (json is None):
            if os.path.exists(os.path.join(themePath, "theme.css")):
                self.name = os.path.basename(themePath)
                self.id = self.name
                self.version = "v1.0"
                self.author = ""
                self.require = 1
                self.injects = [Inject(os.path.join(themePath, "theme.css"), [".*"], self)]
                self.dependencies = []
                return
            elif is_folder_sfp_theme(themePath):
                convert_to_css_theme(themePath, self)
                return
            else:
                raise Exception("Folder does not look like a theme?")
            
            
        jsonPath = path.join(self.themePath, "theme.json")
        
        if path.exists(jsonPath):
            self.created = path.getmtime(jsonPath)

        self.name = json["name"]
        self.display_name = json["display_name"] if ("display_name" in json) else None
        self.id = json["id"] if ("id" in json) else self.name
        self.version = json["version"] if ("version" in json) else "v1.0"
        self.author = json["author"] if ("author" in json) else ""
        self.require = int(json["manifest_version"]) if ("manifest_version" in json) else 1
        self.flags = [x.upper() for x in list(json["flags"])] if ("flags" in json) else []
        self.tab_mappings = json["tabs"] if ("tabs" in json) else {}

        if (CSS_LOADER_VER < self.require):
            raise Exception(f"A newer version of the CssLoader is required to load this theme (Read manifest version {self.require} but only up to {CSS_LOADER_VER} is supported)")

        self.dependencies = json["dependencies"] if "dependencies" in json else {}

        if "inject" in self.json:
            self.injects = to_injects(self.json["inject"], self.themePath, self)
        
        if "patches" in self.json:
            self.patches = [ThemePatch(self, self.json["patches"][x], x) for x in self.json["patches"]]
    
    async def load(self, inject_now : bool = True) -> Result:
        if not path.exists(self.configJsonPath):
            return Result(True)

        try:
            with open(self.configJsonPath, "r") as fp:
                config = json.load(fp)
        except Exception as e:
            return Result(False, str(e))
        
        activate = False

        for x in config:
            if x == "active" and config["active"]:
                activate = True
            else:
                for y in self.patches:
                    if y.name == x:
                        y.set_value(config[x])
        
        if activate:
            result = await self.inject(inject_now)
            if not result.success:
                return result
        
        return Result(True)

    async def save(self) -> Result:
        create_dir(self.configPath)

        try:
            config = {"active": self.enabled}
            for x in self.patches:
                config[x.name] = x.get_value()
            
            with open(self.configJsonPath, "w") as fp:
                json.dump(config, fp)
        
            self.modified = time.time()
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def inject(self, inject_now : bool = True) -> Result:
        Log(f"Injecting theme '{self.name}'")
        for x in self.injects:
            if inject_now:
                await x.inject() # Ignore result for now. It'll be logged but not acted upon
            else:
                x.enabled = True

        for x in self.patches:
            result = await x.inject(inject_now)
            if not result.success:
                return result
        
        self.enabled = True
        await self.save()
        return Result(True)
    
    async def remove(self) -> Result:
        Log(f"Removing theme '{self.name}'")
        for x in self.get_all_injects():
            result = await x.remove()
            if not result.success:
                return result

        self.enabled = False
        await self.save()
        return Result(True)

    async def delete(self) -> Result:
        if (self.bundled):
            return Result(False, "Can't delete a bundled theme")

        result = await self.remove()
        if not result.success:
            return result
        
        try:
            shutil.rmtree(self.themePath)
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    def get_all_injects(self) -> List[Inject]:
        injects = []
        injects.extend(self.injects)
        for x in self.patches:
            injects.extend(x.injects)
        
        return injects
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.get_display_name(),
            "version": self.version,
            "author": self.author,
            "enabled": self.enabled,
            "patches": [x.to_dict() for x in self.patches],
            "bundled": self.bundled,
            "require": self.require,
            "dependencies": [x for x in self.dependencies],
            "flags": self.flags,
            "created": self.created,
            "modified": self.modified,
        }
    
    def get_display_name(self) -> str:
        return self.display_name if (self.display_name is not None) else self.name
    
    def add_prefix(self, id : int):
        if self.display_name is None:
            self.display_name = self.name
        
        self.name += f"_{id}"