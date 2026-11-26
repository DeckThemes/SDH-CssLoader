# CSS Loader
Dynamically loads CSS files from storage and reloads alongside Steam UI.

Read the documentation for this tool at [docs.deckthemes.com](https://docs.deckthemes.com/)

## Local CSS mappings

The **Use Local CSS Mappings** setting loads the existing `css_translations.json`
file from CSS Loader's themes directory and skips remote mapping downloads. On
Linux and SteamOS, the default file is `~/homebrew/themes/css_translations.json`.
Keep this file updated manually while the setting is enabled. CSS Loader checks
that the file contains valid mapping data before switching to local mappings.

Turn the setting off to resume fetching mappings from the selected Steam branch.
When replacing a local map while the setting is enabled, turn the setting off,
replace `css_translations.json` after the remote fetch completes, then turn the
setting back on to load the new file.
