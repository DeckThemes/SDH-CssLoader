import { PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { VFC } from "react";
import { Theme } from "../Theme";

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
            if (switchValue === true && data.dependencies.length > 0) {
              python.toast(
                `${data.name} enabled other themes`,
                // @ts-ignore
                `${new Intl.ListFormat().format(data.dependencies)} ${
                  data.dependencies.length > 1 ? "are" : "is"
                } required for this theme`
              );
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
