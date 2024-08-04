import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { ThemePatch, toggleThemeWithModals, useForcedRerender } from "@/lib";
import { useEffect, useState } from "react";
import { LocalThemeStatus, Theme } from "@/types";
import { ButtonItem, Focusable, PanelSectionRow, ToggleField, showModal } from "@decky/ui";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";

export function QamThemeToggle({ theme }: { theme: Theme }) {
  const updateStatuses = useCSSLoaderValue("updateStatuses");
  const isWorking = useCSSLoaderValue("isWorking");
  const installTheme = useCSSLoaderAction("installTheme");

  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [render, rerender] = useForcedRerender();

  let updateStatus: LocalThemeStatus = "installed";
  const themeArrPlace = updateStatuses.find((f) => f[0] === theme.id);
  if (themeArrPlace) updateStatus = themeArrPlace[1];
  const isOutdated = updateStatus === "outdated";

  // Re-collapse the theme when the theme is updated
  useEffect(() => {
    setCollapsed(true);
  }, [theme.enabled]);

  if (!render) return null;
  return (
    <>
      <PanelSectionRow>
        <Focusable
          className="w-full p-0 m-0 relative"
          onOKActionDescription="Toggle Theme"
          onOptionsActionDescription="Expand Settings"
          onOptionsButton={() => {
            // @ts-ignore
            showModal(<ThemeSettingsModal selectedTheme={theme.id} />);
          }}
          onSecondaryActionDescription={isOutdated ? "Update Theme" : undefined}
          onSecondaryButton={
            isOutdated
              ? async () => {
                  await installTheme(theme.id);
                }
              : undefined
          }
        >
          {isOutdated && <div className="cl-qam-themetoggle-notifbubble" />}
          <ToggleField
            disabled={isWorking}
            bottomSeparator={theme.enabled && theme?.patches?.length > 0 ? "none" : "standard"}
            checked={theme.enabled}
            label={theme.display_name}
            description={`${updateStatus === "outdated" ? "Update Available" : theme.version} | ${
              theme.author
            }`}
            onChange={async (switchValue: boolean) => {
              toggleThemeWithModals(theme, switchValue, rerender);
            }}
          />
        </Focusable>
      </PanelSectionRow>
      {theme.enabled && theme.patches.length > 0 && (
        <>
          <div className="cl-qam-collapse-button-container">
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                bottomSeparator={collapsed ? "standard" : "none"}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <RiArrowDownSFill className="cl-qam-collapse-button-down-arrow" />
                ) : (
                  <RiArrowUpSFill className="cl-qam-collapse-button-up-arrow" />
                )}
              </ButtonItem>
            </PanelSectionRow>
          </div>
          {!collapsed &&
            theme.patches.map((patch, index) => (
              <ThemePatch
                key={patch.name}
                patch={patch}
                themeName={theme.name}
                shouldHaveBottomSeparator={theme.patches.length - 1 === index}
              />
            ))}
        </>
      )}
    </>
  );
}
