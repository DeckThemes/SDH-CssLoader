from css_inject import Inject
from css_utils import Result, get_theme_path
from os.path import join, exists

def hex_to_rgb(hex_num : str) -> tuple[float, float, float]:
    vals = hex_num[1:]

    if len(vals) < 6:
        return (int(vals[0], 16), int(vals[1], 16), int(vals[2], 16))
    else:
        return (int(vals[0:2], 16), int(vals[2:4], 16), int(vals[4:6], 16))

def get_value_from_masks(m1 : float, m2 : float, hue : float) -> int:
    ONE_SIXTH = 1.0/6.0
    TWO_THIRD = 2.0/3.0

    hue = hue % 1.0

    if hue < ONE_SIXTH:
        return m1 + (m2-m1)*hue*6.0
    
    if hue < 0.5:
        return m2
    
    if hue < TWO_THIRD:
        return m1 + (m2-m1)*(TWO_THIRD-hue)*6.0
    
    return m1

def hsl_to_rgb(hue : int, saturation : int, lightness : int) -> tuple[int, int, int]:
    ONE_THIRD = 1.0/3.0

    h = float(hue) / 255.0
    l = float(lightness) / 255.0
    s = float(saturation) / 255.0

    if s == 0.0:
        return (int(l * 255.0), int(l * 255.0), int(l * 255.0))
    
    m2 = l * (1.0 + s) if l <= 0.5 else l + s - (l * s)
    m1 = 2.0 * l - m2

    return (
        int(get_value_from_masks(m1, m2, h + ONE_THIRD) * 255.0),
        int(get_value_from_masks(m1, m2, h) * 255.0),
        int(get_value_from_masks(m1, m2, h - ONE_THIRD) * 255.0)
    )

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
            try:
                if self.value[0] == "#":
                    (r, g, b) = hex_to_rgb(self.value)
                else:
                    hsl_vals = self.value.split(", ")
                    h = hsl_vals[0][5:]
                    s = hsl_vals[1][:len(hsl_vals[1]) - 1]
                    l = hsl_vals[2][:len(hsl_vals[2]) - 1]

                    (r, g, b) = hsl_to_rgb(h, s, l)
    
                self.inject.css = f":root {{ {self.css_variable}: {self.value}; {self.css_variable}_r: {r}; {self.css_variable}_g: {g}; {self.css_variable}_b: {b}; {self.css_variable}_rgb: {r}, {g}, {b}; }}"
            except e:
                self.inject.css = f":root {{ {self.css_variable}: {self.value}; }}"
        elif self.type == "image-picker":
            try:
                self.check_path_image_picker(self.value)
            except Exception as e:
                return Result(False, str(e))

            path = join('/themes_custom/', self.value.replace(' ', '%20').replace('\\', '/'))
            self.inject.css = f":root {{ {self.css_variable}: url({path}) }}"
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