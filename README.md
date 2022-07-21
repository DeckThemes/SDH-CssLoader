# SDH-CssLoader
Dynamically loads css off storage. Also reloads whenever the steam ui reloads

## How it works
The loader reads all folders in `/home/deck/homebrew/themes`. In every folder, it looks for a file called `theme.json`. This json file stores in which tab which css should be injected. An example theme can be found in the themes folder of this repository

[More information about creating themes, and publishing themes to the theme browser can be found here](https://github.com/suchmememanyskill/CssLoader-ThemeDb)