import { DropdownItem, PanelSectionRow, showModal } from "decky-frontend-lib";
import { useMemo } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { useRerender } from "../../hooks";
import { changePreset, getInstalledThemes } from "../../python";
import { useCssLoaderState } from "../../state";
import { Flags } from "../../ThemeTypes";
import { CreatePresetModalRoot } from "../Modals/CreatePresetModal";
import t, { translateThemeTitle } from "../../i18n/i18n";

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
            layout="below"
            label={t("SELECTED_PROFILE", "Selected Profile")}
            selectedOption={
              localThemeList.filter((e) => e.enabled && e.flags.includes(Flags.isPreset)).length > 1
                ? "Invalid State"
                : selectedPreset?.name || "None"
            }
            rgOptions={[
              ...(localThemeList.filter((e) => e.enabled && e.flags.includes(Flags.isPreset))
                .length > 1
                ? [{ data: "Invalid State", label: t("INVALID_STATE", "Invalid State") }]
                : []),
              { data: "None", label: t("NONE", "None") },
              ...presets.map((e) => ({ label: translateThemeTitle(e.display_name, e.name), data: e.name })),
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
                    <span>{t("NEW_PROFILE", "New Profile")}</span>
                  </div>
                ),
              },
            ]}
            onChange={async ({ data }) => {
              if (data === "New Profile") {
                showModal(
                  // @ts-ignore
                  <CreatePresetModalRoot />
                );
                rerender();
                return;
              }
              await changePreset(data, localThemeList);
              getInstalledThemes();
            }}
          />
        </PanelSectionRow>
      )}
    </>
  );
}
