# SDH-CssLoader
Dynamically loads css off storage. Also reloads whenever the steam ui reloads

## How it works
The loader reads all folders in `/home/deck/homebrew/themes`. In every folder, it looks for a file called `theme.json`. This json file stores in which tab which css should be injected. An example theme can be found in the themes folder of this repository

Structure of `theme.json`:

```
{
    "name": "OrangeToggles",
    "version": "0.1",
    "inject": { # <-- Anything in here will be applied when you enable the theme
        "shared.css": [ # <-- A css file that should be loaded 
            "QuickAccess" # <-- Which tabs the css should be injected into
        ] 
    }
}
```

![example1](https://raw.githubusercontent.com/suchmememanyskill/SDH-CssLoader/main/images/example1.png)

Additionally, you can add 'patches', which are extra options the user can choose from. You can activate it as follows:

```
{
    "name": "Colored Toggles",
    "version": "0.1",
    "inject": { # <-- Anything in here will be applied when you enable the theme
        "shared.css": [ # <-- A css file that should be loaded 
            "QuickAccess", "SP", "MainMenu" # <-- Which tabs the css should be injected into
        ] 
    },
    "patches": {
        "Theme Color": { # <-- The name of the setting
            "default": "orange", # <-- The name of the default option. This is required
            "orange": {}, # <-- An orange option, that applies no additional css
            "lime": { # <-- A lime option, that applies 'colors/lime.css'. Anything in here works the same as the 'inject' section
                "colors/lime.css": ["QuickAccess", "SP", "MainMenu"]
            },
            "red": {
                "colors/red.css": ["QuickAccess", "SP", "MainMenu"]
            }
        }
    }
}
```

![example2](https://raw.githubusercontent.com/suchmememanyskill/SDH-CssLoader/main/images/example2.png)

## Credits
- The classic theme in the themes folder is made by [NegativeI0N](https://github.com/NegativeI0N/SDH-ClassicTheme)
