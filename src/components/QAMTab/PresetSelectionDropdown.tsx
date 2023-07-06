import { DropdownItem, PanelSectionRow, showModal } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Flags } from "../../ThemeTypes";
import { useMemo } from "react";
import { changePreset, getInstalledThemes, setThemeState } from "../../python";
import { CreatePresetModal } from "../AllThemes/CreatePresetModal";
import { FiPlusCircle } from "react-icons/fi";

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
          selectedOption={selectedPreset?.name || "None"}
          rgOptions={[
            { data: "None", label: "None" },
            ...presets.map((e) => ({ label: e.name, data: e.name })),
            {
              data: "New Profile",
              label: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                    gap: "1em",
                  }}
                >
                  <FiPlusCircle />
                  <span>New Profile</span>
                </div>
              ),
            },
          ]}
          onChange={async ({ data }) => {
            if (data === "New Profile") {
              showModal(
                // @ts-ignore
                <CreatePresetModal enabledNumber={localThemeList.filter((e) => e.enabled).length} />
              );
              return;
            }
            data === "None" && selectedPreset
              ? await setThemeState(selectedPreset.name, false)
              : await changePreset(data, localThemeList);
            getInstalledThemes();
          }}
        />
      </PanelSectionRow>
    </>
  );
}
