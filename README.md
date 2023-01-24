# CSS Loader
Dynamically loads CSS files from storage and reloads alongside Steam UI.

# Overview
The loader reads all folders in `/home/deck/homebrew/themes`. In every folder, it reads a `theme.json` file that stores how the CSS should be injected.

[Information about creating and publishing themes can be found here](https://docs.deckthemes.com/#/CSSLoader/README?id=%f0%9f%8e%a8-creating-a-theme)

# Installation
1. [Install the Decky plugin loader](https://github.com/SteamDeckHomebrew/decky-loader#installation)
2. Use the built in plugin store to download the CSS Loader

# Custom Theme Repositories
Custom repositories can be added by adding a valid url to `~/homebrew/themes/repos.txt`. One url per line. Comments ('#', '//') are supported. Empty lines are ignored. Url needs to return the same information as the [CssLoader ThemeDb Release Json](https://github.com/suchmememanyskill/CssLoader-ThemeDb/releases)
