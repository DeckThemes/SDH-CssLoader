import { ButtonItem, Focusable, PanelSectionRow, ToggleField, showModal } from "decky-frontend-lib";
import { VFC, useState, useMemo } from "react";
import { Flags, Theme } from "../ThemeTypes";

import * as python from "../python";
import { ThemePatch } from "./ThemePatch";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { OptionalDepsModalRoot } from "./OptionalDepsModal";
import { CssLoaderState, useCssLoaderState } from "../state";
import { useRerender } from "../hooks";
// This has to be a direct import to avoid the circular dependency
import { ThemeSettingsModalRoot } from "./AllThemes/ThemeSettingsModal";

export const ThemeToggle: VFC<{
  data: Theme;
  collapsible?: boolean;
  showModalButtonPrompt?: boolean;
}> = ({ data, collapsible = false, showModalButtonPrompt = false }) => {
  const { selectedPreset, localThemeList } = useCssLoaderState();
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const [render, rerender] = useRerender();

  const isPreset = useMemo(() => {
    if (data.flags.includes(Flags.isPreset)) {
      return true;
    }
    return false;
    // This might not actually memoize it as data.flags is an array, so idk if it deep checks the values here
  }, [data.flags]);

  const focusableProps = showModalButtonPrompt
    ? {
        onOptionsActionDescription: "View Expanded Settings",
        onOptionsButton: () => {
          showModal(
            // @ts-ignore
            <ThemeSettingsModalRoot selectedTheme={data.id} />
          );
        },
      }
    : {};

  return (
    <>
      {render && (
        <>
          <PanelSectionRow>
            <Focusable style={{ width: "100%", padding: 0, margin: 0 }} {...focusableProps}>
              <ToggleField
                bottomSeparator={data.enabled && data?.patches?.length > 0 ? "none" : "standard"}
                checked={data.enabled}
                label={data.name}
                description={isPreset ? `Preset` : `${data.version} | ${data.author}`}
                onChange={async (switchValue: boolean) => {
                  if (switchValue === true && data.flags.includes(Flags.optionalDeps)) {
                    // @ts-ignore
                    showModal(<OptionalDepsModalRoot themeData={data} />);
                    rerender();
                    return;
                  }
                  // Actually enabling the theme
                  await python.setThemeState(data.name, switchValue);
                  await python.getInstalledThemes();
                  // Re-collapse menu
                  setCollapsed(true);
                  // Dependency Toast
                  if (data.dependencies.length > 0) {
                    if (switchValue) {
                      python.toast(
                        `${data.name} enabled other themes`,
                        // This lists out the themes by name, but often overflowed off screen
                        // @ts-ignore
                        // `${new Intl.ListFormat().format(data.dependencies)} ${
                        //   data.dependencies.length > 1 ? "are" : "is"
                        // } required for this theme`
                        // This just gives the number of themes
                        `${
                          data.dependencies.length === 1
                            ? `1 other theme is required by ${data.name}`
                            : `${data.dependencies.length} other themes are required by ${data.name}`
                        }`
                      );
                    }
                    if (!switchValue && !data.flags.includes(Flags.dontDisableDeps)) {
                      python.toast(
                        `${data.name} disabled other themes`,
                        // @ts-ignore
                        `${
                          data.dependencies.length === 1
                            ? `1 theme was originally enabled by ${data.name}`
                            : `${data.dependencies.length} themes were originally enabled by ${data.name}`
                        }`
                      );
                    }
                  }
                  if (!selectedPreset) return;
                  // This is copied from the desktop codebase
                  // If we refactor the desktop version of this function (which we probably should) this should also be refactored
                  await python.generatePresetFromThemeNames(
                    selectedPreset.name,
                    switchValue
                      ? [
                          ...localThemeList
                            .filter((e) => e.enabled && !e.flags.includes(Flags.isPreset))
                            .map((e) => e.name),
                          data.name,
                        ]
                      : localThemeList
                          .filter(
                            (e) =>
                              e.enabled && !e.flags.includes(Flags.isPreset) && e.name !== data.name
                          )
                          .map((e) => e.name)
                  );
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
