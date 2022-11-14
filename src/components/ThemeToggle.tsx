import { PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { VFC } from "react";
import { Theme } from "../theme";

import * as python from "../python";
import { ThemePatch } from "./ThemePatch";

export const ThemeToggle: VFC<{ data: Theme; setThemeList: any }> = ({ data, setThemeList }) => {
  return (
    <>
      <PanelSectionRow>
        <ToggleField
          bottomSeparator={data.checked && data?.patches?.length > 0 ? "none" : "standard"}
          checked={data.checked}
          label={data.name}
          description={data.description}
          onChange={(switchValue: boolean) => {
            // Actually enabling the theme
            python.resolve(python.setThemeState(data.name, switchValue), () => {
              python.resolve(python.getThemes(), setThemeList);
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
      {data.checked &&
        data.patches.map((x, i, arr) => <ThemePatch data={x} index={i} fullArr={arr} />)}
    </>
  );
};
