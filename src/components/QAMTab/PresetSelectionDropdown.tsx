import { DropdownItem, PanelSectionRow, showModal } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Flags } from "../../ThemeTypes";
import { useMemo, useState } from "react";
import { changePreset, getInstalledThemes, setThemeState } from "../../python";
import { CreatePresetModal } from "../AllThemes/CreatePresetModal";
import { FiPlusCircle } from "react-icons/fi";
import { useRerender } from "../../hooks";

export function PresetSelectionDropdown() {
  const { localThemeList, selectedPreset } = useCssLoaderState();
  const presets = useMemo(
    () => localThemeList.filter((e) => e.flags.includes(Flags.isPreset)),
    [localThemeList]
  );
  const [render, rerender] = useRerender();
  return (
    <>
      {render && (
        <PanelSectionRow>
          <DropdownItem
            label="Selected Profile"
            selectedOption={
              localThemeList.filter((e) => e.enabled && e.flags.includes(Flags.isPreset)).length > 1
                ? "Invalid State"
                : selectedPreset?.name || "None"
            }
            rgOptions={[
              { data: "None", label: "None" },
              ...presets.map((e) => ({ label: e.name, data: e.name })),
              // This is a jank way of only adding it if creatingNewProfile = false
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
                  <CreatePresetModal
                    enabledNumber={localThemeList.filter((e) => e.enabled).length}
                  />
                );
                rerender();
                return;
              }
              data === "None" && selectedPreset
                ? await setThemeState(selectedPreset.name, false)
                : await changePreset(data, localThemeList);
              getInstalledThemes();
            }}
          />
        </PanelSectionRow>
      )}
    </>
  );
}
