from css_inject import Inject
from css_utils import Result

class ThemePatchComponent:
    def __init__(self, themePatch, component : dict):
        self.themePatch = themePatch

        # Intentionally not doing error checking here. This should error when loaded incorrectly
        self.name = component["name"]
        self.type = component["type"]

        if self.type not in ["color-picker"]:
            raise Exception(f"Unknown component type '{self.type}'")

        self.default = component["default"]
        self.value = self.default
        self.on = component["on"]
        self.css_variable = component["css_variable"]

        self.tabs = component["tabs"]
        self.inject = Inject("", self.tabs, self.themePatch.theme)
        self.generate()

    def generate(self) -> Result:
        if (";" in self.css_variable or ";" in self.value):
            raise Exception("???")

        self.inject.css = f":root {{ --{self.css_variable}: {self.value}; }}"
        return Result(True)

    async def generate_and_reinject(self) -> Result:
        self.generate()
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