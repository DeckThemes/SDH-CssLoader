import { PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { VFC } from "react";
import { Flags, Theme } from "../ThemeTypes";

import * as python from "../python";
import { ThemePatch } from "./ThemePatch";

export const ThemeToggle: VFC<{ data: Theme }> = ({ data }) => {
  return (
    <>
      <PanelSectionRow>
        <ToggleField
          bottomSeparator={data.enabled && data?.patches?.length > 0 ? "none" : "standard"}
          checked={data.enabled}
          label={data.name}
          description={`${data.version} | ${data.author}`}
          onChange={(switchValue: boolean) => {
            // Actually enabling the theme
            python.resolve(python.setThemeState(data.name, switchValue), () => {
              python.getInstalledThemes();
            });
            // Dependency Toast
            if (data.dependencies.length > 0) {
              if (switchValue === true) {
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
                return;
              }
              if (!data.flags.includes(Flags.dontDisableDeps)) {
                python.toast(
                  `${data.name} disabled other themes`,
                  // @ts-ignore
                  `${
                    data.dependencies.length === 1
                      ? `1 theme was originally enabled by ${data.name}`
                      : `${data.dependencies.length} themes were originally enabled by ${data.name}`
                  }`
                );
                return;
              }
            }
          }}
        />
      </PanelSectionRow>
      {data.enabled &&
        data.patches.map((x, i, arr) => (
          <ThemePatch data={x} index={i} fullArr={arr} themeName={data.name} />
        ))}
    </>
  );
};
