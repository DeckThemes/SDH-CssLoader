import { ButtonItem, Focusable, PanelSectionRow, ToggleField, showModal } from "decky-frontend-lib";
import { VFC, useState, useMemo } from "react";
import { Flags, LocalThemeStatus, Theme, UpdateStatus } from "../ThemeTypes";

import { ThemePatch } from "./ThemePatch";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { useCssLoaderState } from "../state";
import { useRerender } from "../hooks";
// This has to be a direct import to avoid the circular dependency
import { ThemeSettingsModalRoot } from "./Modals/ThemeSettingsModal";
import { installTheme } from "../api";
import { toggleTheme } from "../backend/backendHelpers/toggleTheme";

export const ThemeToggle: VFC<{
  data: Theme;
  collapsible?: boolean;
  showModalButtonPrompt?: boolean;
}> = ({ data, collapsible = false, showModalButtonPrompt = false }) => {
  const { updateStatuses, setGlobalState, isInstalling } = useCssLoaderState();
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const [render, rerender] = useRerender();

  const isPreset = useMemo(() => {
    if (data.flags.includes(Flags.isPreset)) {
      return true;
    }
    return false;
    // This might not actually memoize it as data.flags is an array, so idk if it deep checks the values here
  }, [data.flags]);

  let [updateStatus]: [LocalThemeStatus] = ["installed"];
  const themeArrPlace = updateStatuses.find((f) => f[0] === data.id);
  if (themeArrPlace) {
    updateStatus = themeArrPlace[1];
  }

  // I extracted these here as doing conditional props inline sucks
  const modalButtonProps = showModalButtonPrompt
    ? {
        onOptionsActionDescription: "Expand Settings",
        onOptionsButton: () => {
          showModal(
            // @ts-ignore
            <ThemeSettingsModalRoot selectedTheme={data.id} />
          );
        },
      }
    : {};

  const updateButtonProps =
    updateStatus === "outdated"
      ? {
          onSecondaryButton: async () => {
            await installTheme(data.id);
            // This just updates the updateStatuses arr to know that this theme now is up to date, no need to re-fetch the API to know that
            setGlobalState(
              "updateStatuses",
              updateStatuses.map((e) => (e[0] === data.id ? [data.id, "installed", false] : e))
            );
          },
          onSecondaryActionDescription: "Update Theme",
        }
      : {};

  return (
    <>
      {render && (
        <>
          <PanelSectionRow>
            <Focusable
              style={{ width: "100%", padding: 0, margin: 0, position: "relative" }}
              onOKActionDescription="Toggle Theme"
              {...modalButtonProps}
              {...updateButtonProps}
            >
              {updateStatus === "outdated" && (
                <div
                  className="CssLoader_ThemeBrowser_SingleItem_NotifBubble"
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "-1em",
                    // This creates the triangle effect
                    background: "linear-gradient(45deg, transparent 49%, #fca904 50%)",
                    // The focusRing has a z index of 10000, so this is just to be cheeky
                    zIndex: "10001",
                    width: "20px",
                    height: "20px",
                  }}
                ></div>
              )}
              <ToggleField
                disabled={isInstalling}
                bottomSeparator={data.enabled && data?.patches?.length > 0 ? "none" : "standard"}
                checked={data.enabled}
                label={data.display_name}
                description={
                  isPreset
                    ? `Preset`
                    : `${updateStatus === "outdated" ? "Update Available" : data.version} | ${
                        data.author
                      }`
                }
                onChange={async (switchValue: boolean) => {
                  toggleTheme(data, switchValue, rerender, setCollapsed);
                }}
              />
            </Focusable>
          </PanelSectionRow>
          {data.enabled && data.patches.length > 0 && (
            <>
              {collapsible && (
                <div className="CSSLoader_QAM_CollapseButton_Container">
                  <PanelSectionRow>
                    <ButtonItem
                      layout="below"
                      bottomSeparator={collapsed ? "standard" : "none"}
                      onClick={() => setCollapsed(!collapsed)}
                    >
                      {collapsed ? (
                        <RiArrowDownSFill
                          style={{ transform: "translate(0, -13px)", fontSize: "1.5em" }}
                        />
                      ) : (
                        <RiArrowUpSFill
                          style={{ transform: "translate(0, -12px)", fontSize: "1.5em" }}
                        />
                      )}
                    </ButtonItem>
                  </PanelSectionRow>
                </div>
              )}
              {!collapsible || !collapsed
                ? data.patches.map((x, i, arr) => (
                    <ThemePatch data={x} index={i} fullArr={arr} themeName={data.name} />
                  ))
                : null}
            </>
          )}
        </>
      )}
    </>
  );
};
