import { DropdownItem, PanelSectionRow } from "@decky/ui";
import { Flags } from "@/types";
import { useMemo } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { useForcedRerender } from "../../hooks";
import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";

export function PresetSelectionDropdown() {
  const themes = useCSSLoaderValue("themes");
  const selectedPreset = useCSSLoaderValue("selectedPreset");
  const changePreset = useCSSLoaderAction("changePreset");
  const presets = themes.filter((e) => e.flags.includes(Flags.isPreset));
  const hasInvalidPresetState = presets.filter((e) => e.enabled).length > 1;

  const [render, rerender] = useForcedRerender();

  console.log(themes, presets, selectedPreset, hasInvalidPresetState);

  return (
    <>
      {render && (
        <PanelSectionRow>
          <DropdownItem
            label="Selected Profile"
            selectedOption={
              hasInvalidPresetState ? "Invalid State" : selectedPreset?.name || "None"
            }
            rgOptions={[
              ...(hasInvalidPresetState ? [{ data: "Invalid State", label: "Invalid State" }] : []),
              { data: "None", label: "None" },
              ...presets.map((e) => ({ label: e.display_name, data: e.name })),
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
                // showModal(<CreatePresetModalRoot />);
                rerender();
                return;
              }
              await changePreset(data);
            }}
          />
        </PanelSectionRow>
      )}
    </>
  );
}
