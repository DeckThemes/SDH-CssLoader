import os, json, shutil
from os import path
from typing import List
from css_inject import Inject
from css_utils import Result, Log, create_dir
from css_themepatch import ThemePatch

CSS_LOADER_VER = 4

class Theme:
    def __init__(self, themePath : str, json : dict, configPath : str = None):
        self.name = json["name"]
        self.version = json["version"] if ("version" in json) else "v1.0"
        self.author = json["author"] if ("author" in json) else ""
        self.require = int(json["manifest_version"]) if ("manifest_version" in json) else 1

        if (CSS_LOADER_VER < self.require):
            raise Exception("A newer version of the CssLoader is required to load this theme")

        self.patches = []
        self.injects = []

        self.configPath = configPath if (configPath is not None) else themePath
        self.configJsonPath = self.configPath + "/config" + ("_ROOT.json" if os.geteuid() == 0 else "_USER.json")
        self.themePath = themePath
        self.bundled = self.configPath != self.themePath
        self.dependencies = json["dependencies"] if "dependencies" in json else {}

        self.enabled = False
        self.json = json

        if "inject" in self.json:
            self.injects = [Inject(self.themePath + "/" + x, self.json["inject"][x], self) for x in self.json["inject"]]
        
        if "patches" in self.json:
            self.patches = [ThemePatch(self, self.json["patches"][x], x) for x in self.json["patches"]]
    
    async def load(self) -> Result:
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
            result = await self.inject()
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
        
        except Exception as e:
            return Result(False, str(e))
        
        return Result(True)

    async def inject(self) -> Result:
        Log(f"Injecting theme '{self.name}'")
        for x in self.injects:
            result = await x.inject()
            if not result.success:
                return result

        for x in self.patches:
            result = await x.inject()
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
            "name": self.name,
            "version": self.version,
            "author": self.author,
            "enabled": self.enabled,
            "patches": [x.to_dict() for x in self.patches],
            "bundled": self.bundled,
            "require": self.require,
            "dependencies": [x for x in self.dependencies]
        }