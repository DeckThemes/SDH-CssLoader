from css_inject import Inject, to_injects
from css_themepatchcomponent import ThemePatchComponent
from css_utils import Log, Result

class ThemePatch:
    def __init__(self, theme, json : dict, name : str):
        self.json = json
        self.name = name
        self.default = json["default"] if "default" in json else None
        self.type = json["type"] if "type" in json else "dropdown"
        self.theme = theme
        self.value = self.default
        self.injects = []
        self.options = {}
        self.patchVersion = None
        self.components = []

        if "values" in json: # Do we have a v2 or a v1 format?
            self.patchVersion = 2
            for x in json["values"]:
                self.options[x] = []
        else:
            self.patchVersion = 1
            for x in json:
                if (x == "default"):
                    continue

                self.options[x] = []
        
        if len(self.options) <= 0:
            raise Exception(f"In patch '{name}' there is less than 1 value present")

        if self.default is None:
            self.default = list(self.options.keys())[0]
        
        if self.default not in self.options:
            raise Exception(f"In patch '{self.name}', '{self.default}' does not exist as a patch option")
        
        self.load()

    def set_value(self, value):
        if isinstance(value, str):
            self.value = value
        elif isinstance(value, dict):
            if "value" in value:
                self.value = value["value"]
            
            if "components" in value:
                components = value["components"]

                if not isinstance(components, dict):
                    raise Exception("???")
                
                for x in self.components:
                    if x.name in components:
                        x.value = components[x.name]
                        x.generate()
    
    def get_value(self) -> str | dict:
        if len(self.components) <= 0:
            return self.value
        else:
            components = {}
            for x in self.components:
                components[x.name] = x.value
            
            return {
                "value": self.value,
                "components": components,
            }

    def check_value(self):
        if (self.value not in self.options):
            self.value = self.default

        if (self.type not in ["dropdown", "checkbox", "slider", "none"]):
            self.type = "dropdown"
        
        if (self.type == "checkbox"):
            if not ("No" in self.options and "Yes" in self.options):
                self.type = "dropdown"
    
    def load(self):
        for x in self.options:
            data = self.json[x] if self.patchVersion == 1 else self.json["values"][x]

            items = to_injects(data, self.theme.themePath, self.theme)
            self.injects.extend(items)
            self.options[x].extend(items)
        
        if "components" in self.json:
            for x in self.json["components"]:
                component = ThemePatchComponent(self, x)
                if component.on not in self.options:
                    raise Exception("Component references non-existent value")
                
                self.components.append(component)
                self.injects.append(component.inject)
                self.options[component.on].append(component.inject)

        self.check_value()

    async def inject(self, inject_now : bool = True) -> Result:
        self.check_value()
        Log(f"Injecting patch '{self.name}' of theme '{self.theme.name}'")
        for x in self.options[self.value]:
            if inject_now:
                await x.inject() # Ignore result for now. It'll be logged but not acted upon
            else:
                x.enabled = True

        return Result(True)

    async def remove(self) -> Result:
        self.check_value()
        Log(f"Removing patch '{self.name}' of theme '{self.theme.name}'")
        for x in self.injects:
            result = await x.remove()
            if not result.success:
                return result
        
        return Result(True)
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "default": self.default,
            "value": self.value,
            "options": [x for x in self.options],
            "type": self.type,
            "components": [x.to_dict() for x in self.components]
        }