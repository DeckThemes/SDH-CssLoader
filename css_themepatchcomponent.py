from css_inject import Inject, to_inject
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

    h = float(hue) / 360.0
    l = float(lightness) / 100.0
    s = float(saturation) / 100.0

    if s == 0.0:
        return (int(l * 100.0), int(l * 100.0), int(l * 100.0))
    
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
        self.inject = to_inject("", self.tabs, "", self.themePatch.theme)
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
                if self.value[0] == "#": # Try to parse as hex value
                    (r, g, b) = hex_to_rgb(self.value)
                elif (self.value.startswith("hsla(") or self.value.startswith("hsl(")) and self.value.endswith(")"): # Try to parse as hsl(a) value
                    hsl_vals = self.value[self.value.find("(") + 1:-1].split(",")
                    # Start: hsla(39, 100%, 50%, 1)
                    # .find: Removes hsla(. Result: '39, 100%, 50%, 1)'
                    # -1: Removes ). Result: '39, 100%, 50%, 1'
                    # Split Result: '39', ' 100%', ' 50%', ' 1'

                    h = hsl_vals[0].strip()
                    # .strip: Removes any whitespace, just in case

                    s = hsl_vals[1].strip()[:-1]
                    # .strip: Removes any whitespace (' 100%' -> '100%')
                    # -1: Removes % ('100%' -> '100')

                    l = hsl_vals[2].strip()[:-1]
                    # .strip: Removes any whitespace (' 50%' -> '50%')
                    # -1: Removes % ('50%' -> '50')

                    (r, g, b) = hsl_to_rgb(h, s, l)
                else:
                    raise Exception(f"Unable to parse color-picker value '{self.value}'")
    
                self.inject.css = f":root {{ {self.css_variable}: {self.value}; {self.css_variable}_r: {r}; {self.css_variable}_g: {g}; {self.css_variable}_b: {b}; {self.css_variable}_rgb: {r}, {g}, {b}; }}"
            except Exception as e:
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