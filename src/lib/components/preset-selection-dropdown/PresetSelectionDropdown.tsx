import { DropdownItem, PanelSectionRow } from "@decky/ui";
import { Flags } from "@/types";
import { useMemo } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { useForcedRerender } from "../../hooks";
import { useCSSLoaderAction, useCSSLoaderStateValue } from "@/backend";

export function PresetSelectionDropdown() {
  const themes = useCSSLoaderStateValue("themes");
  const selectedPreset = useCSSLoaderStateValue("selectedPreset");
  const changePreset = useCSSLoaderAction("changePreset");
  const presets = useMemo(() => themes.filter((e) => e.flags.includes(Flags.isPreset)), [themes]);
  const hasInvalidPresetState = presets.length > 1;

  const [render, rerender] = useForcedRerender();

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
