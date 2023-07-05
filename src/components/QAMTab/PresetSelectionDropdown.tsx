import { DropdownItem, PanelSectionRow } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Flags } from "../../ThemeTypes";
import { useMemo } from "react";
import { changePreset, getInstalledThemes } from "../../python";

export function PresetSelectionDropdown() {
  const { localThemeList, selectedPreset } = useCssLoaderState();
  const presets = useMemo(
    () => localThemeList.filter((e) => e.flags.includes(Flags.isPreset)),
    [localThemeList]
  );
  return (
    <>
      <PanelSectionRow>
        <DropdownItem
          label="Selected Profile"
          selectedOption={selectedPreset?.name || ""}
          rgOptions={presets.map((e) => ({ label: e.name, data: e.name }))}
          onChange={async ({ data }) => {
            if (data === "New Profile") {
              return;
            }
            await changePreset(data, localThemeList);
            getInstalledThemes();
          }}
        />
      </PanelSectionRow>
    </>
  );
}
