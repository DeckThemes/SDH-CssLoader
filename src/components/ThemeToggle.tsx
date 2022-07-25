import { PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { VFC } from "react";
import { Theme } from "../theme";

import * as python from "../python";
import { ThemePatch } from "./ThemePatch";

export const ThemeToggle: VFC<{ data: Theme; setThemeList: any }> = ({
  data,
  setThemeList,
}) => {
  return (
    <>
      <PanelSectionRow>
        <ToggleField
          checked={data.checked}
          label={data.name}
          description={data.description}
          onChange={(switchValue: boolean) => {
            python.resolve(python.setThemeState(data.name, switchValue), () => {
              python.resolve(python.getThemes(), setThemeList);
            });
          }}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        {data.checked && data.patches.map((x) => <ThemePatch data={x} />)}
      </PanelSectionRow>
    </>
  );
};
