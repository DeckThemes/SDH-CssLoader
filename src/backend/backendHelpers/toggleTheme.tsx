import { Dispatch, SetStateAction } from "react";
import { Flags, Theme } from "../../ThemeTypes";
import * as python from "../../python";
import { OptionalDepsModalRoot } from "../../components";
import { showModal } from "decky-frontend-lib";
import { enableNavPatch } from "../../deckyPatches/NavPatch";
import { NavPatchInfoModalRoot } from "../../deckyPatches/NavPatchInfoModal";

// rerender and setCollapsed only apply to the QAM list version of the ThemeToggle, not the one in the fullscreen 'Your Themes' modal
export async function toggleTheme(
  data: Theme,
  enabled: boolean,
  rerender: () => void = () => {},
  setCollapsed: Dispatch<SetStateAction<boolean>> = () => {}
) {
  const { selectedPreset, navPatchInstance } = python.globalState!.getPublicState();

  // Optional Deps Themes
  if (enabled && data.flags.includes(Flags.optionalDeps)) {
    showModal(<OptionalDepsModalRoot themeData={data} />);
    rerender && rerender();
  } else {
    // Actually enabling the theme
    await python.setThemeState(data.name, enabled);
    await python.getInstalledThemes();
  }

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
  if (enabled && data.flags.includes(Flags.navPatch) && !navPatchInstance) {
    showModal(<NavPatchInfoModalRoot themeData={data} />);
  }

  // Preset Updating
  if (!selectedPreset) return;
  // Fetch this here so that the data is up to date
  const { localThemeList } = python.globalState!.getPublicState();

  // This is copied from the desktop codebase
  await python.generatePresetFromThemeNames(
    selectedPreset.name,
    localThemeList.filter((e) => e.enabled && !e.flags.includes(Flags.isPreset)).map((e) => e.name)
  );
  // Getting the new data for the preset
  await python.getInstalledThemes();
}
