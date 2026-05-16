import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { Flags } from "@/types";
import { DropdownItem, PanelSectionRow, showModal } from "@decky/ui";
import { FiPlusCircle } from "react-icons/fi";
import { useForcedRerender } from "../../hooks";
import { CreateProfileModal } from "../modals";

export function PresetSelectionDropdown({ noBottomSeparator }: { noBottomSeparator?: boolean }) {
  const { themes, selectedPreset } = useCSSLoaderValues();
  const { changePreset } = useCSSLoaderActions();
  const presets = themes.filter((e) => e.flags.includes(Flags.isPreset));
  const hasInvalidPresetState = presets.filter((e) => e.enabled).length > 1;

  const [render, rerender] = useForcedRerender();

  return (
    <>
      {render && (
        <PanelSectionRow>
          <DropdownItem
            bottomSeparator={noBottomSeparator ? "none" : "standard"}
            label="Selected Profile"
            layout="below"
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
                showModal(<CreateProfileModal />);
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
