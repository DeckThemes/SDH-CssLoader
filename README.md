# SDH-CssLoader
Dynamically loads css off the disk.

## How it works
The loader reads all folders in `/home/deck/homebrew/themes`. In every folder, it looks for a file called `theme.json`. This json file stores in which tab which css should be injected. An example theme can be found in the themes folder of this repository

Structure of `theme.json`:

```
{
    "name": "OrangeToggles",
    "version": "0.1",
    "inject": {
        "shared.css": [
            "QuickAccess"
        ] 
    }
}
```