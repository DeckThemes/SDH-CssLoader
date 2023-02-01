from css_inject import Inject
from css_utils import Result, get_theme_path
from os.path import join, exists

class ThemePatchComponent:
    def __init__(self, themePatch, component : dict):
        self.themePatch = themePatch

        # Intentionally not doing error checking here. This should error when loaded incorrectly
        self.name = component["name"]
        self.type = component["type"]

        if self.type not in ["color-picker", "image-picker"]:
            raise Exception(f"Unknown component type '{self.type}'")

        self.default = component["default"]

        if self.type == "color-picker":
            try:
                self.check_value_color_picker(self.default)
            except Exception as e:
                Result(False, str(e))
                self.default = "#FFFFFF"
        elif self.type == "image-picker":
            self.check_path_image_picker(self.default)

        self.value = self.default
        self.on = component["on"]
        self.css_variable = component["css_variable"]

        if not self.css_variable.startswith("--"):
            self.css_variable = f"--{self.css_variable}"

        self.tabs = component["tabs"]
        self.inject = Inject("", self.tabs, self.themePatch.theme)
        self.generate()

    def check_value_color_picker(self, value : str):
        '''Expected: #0123456'''
        if value[0] != "#":
            raise Exception("Color picker default is not a valid hex value")
            
        if len(value) not in [4,5,7,9]:
            raise Exception("Color picker default is not a valid hex value")

        for x in value[1:]:
            if x not in "1234567890ABCDEFabcdef":
                raise Exception("Color picker default is not a valid hex value")
    
    def check_path_image_picker(self, path : str):
        themePath = get_theme_path()
        if path.strip().startswith("/"):
            raise Exception(f"Image Picker path cannot be absolute")

        for x in [x.strip() for x in path.split("/")]:
            if (x == ".."):
                raise Exception("Going back in a relative path is not allowed")
        
        if not exists(join(themePath, path)):
            raise Exception("Image Picker specified image does not exist")

    def generate(self) -> Result:
        if (";" in self.css_variable or ";" in self.value):
            return Result(False, "???")

        if self.type == "color-picker":        
            self.inject.css = f":root {{ {self.css_variable}: {self.value}; }}"
        elif self.type == "image-picker":
            try:
                self.check_path_image_picker(self.value)
            except Exception as e:
                return Result(False, str(e))

            self.inject.css = f":root {{ {self.css_variable}: url({join('/themes_custom/', self.value.replace(' ', '%20'))}) }}"
        return Result(True)

    async def generate_and_reinject(self) -> Result:
        result = self.generate()
        if not result.success:
            return result

        if (self.inject.enabled):
            result = await self.inject.inject()
            if not result.success:
                return result
        
        return Result(True)
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "type": self.type,
            "on": self.on,
            "value": self.value,
        }