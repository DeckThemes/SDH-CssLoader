import { Dispatch, SetStateAction } from "react";
import { Flags, Theme } from "../../ThemeTypes";
import * as python from "../../python";
import { OptionalDepsModalRoot } from "../../components";
import { showModal } from "decky-frontend-lib";
import { enableNavPatch } from "../../deckyPatches/NavPatch";

// rerender and setCollapsed only apply to the QAM list version of the ThemeToggle, not the one in the fullscreen 'Your Themes' modal
export async function toggleTheme(
  data: Theme,
  enabled: boolean,
  rerender?: () => void,
  setCollapsed?: Dispatch<SetStateAction<boolean>>
) {
  const { selectedPreset, localThemeList } = python.globalState!.getPublicState();
  // Optional Deps Themes
  if (enabled && data.flags.includes(Flags.optionalDeps)) {
    showModal(<OptionalDepsModalRoot themeData={data} />);
    rerender && rerender();
    return;
  }

  // Actually enabling the theme
  await python.setThemeState(data.name, enabled);
  await python.getInstalledThemes();

  // Re-collapse menu
  setCollapsed && setCollapsed(true);

  // Dependency Toast
  if (data.dependencies.length > 0) {
    if (enabled) {
      python.toast(
        `${data.display_name} enabled other themes`,
        // This lists out the themes by name, but often overflowed off screen
        // @ts-ignore
        // `${new Intl.ListFormat().format(data.dependencies)} ${
        //   data.dependencies.length > 1 ? "are" : "is"
        // } required for this theme`
        // This just gives the number of themes
        `${
          data.dependencies.length === 1
            ? `1 other theme is required by ${data.display_name}`
            : `${data.dependencies.length} other themes are required by ${data.display_name}`
        }`
      );
    }
    if (!enabled && !data.flags.includes(Flags.dontDisableDeps)) {
      python.toast(
        `${data.display_name} disabled other themes`,
        `${
          data.dependencies.length === 1
            ? `1 theme was originally enabled by ${data.display_name}`
            : `${data.dependencies.length} themes were originally enabled by ${data.display_name}`
        }`
      );
    }
  }

  // Nav Patch
  if (data.flags.includes(Flags.navPatch)) {
    python.toast("This theme needs the nav patch", "hi sims");
    enableNavPatch();
  }

  // Preset Upating
  if (!selectedPreset) return;
  // This is copied from the desktop codebase
  // If we refactor the desktop version of this function (which we probably should) this should also be refactored
  await python.generatePresetFromThemeNames(
    selectedPreset.name,
    enabled
      ? [
          ...localThemeList
            .filter((e) => e.enabled && !e.flags.includes(Flags.isPreset))
            .map((e) => e.name),
          data.name,
        ]
      : localThemeList
          .filter((e) => e.enabled && !e.flags.includes(Flags.isPreset) && e.name !== data.name)
          .map((e) => e.name)
  );
}
