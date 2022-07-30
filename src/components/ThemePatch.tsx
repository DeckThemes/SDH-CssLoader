import { DropdownItem, PanelSectionRow } from "decky-frontend-lib";
import * as python from "../python";
import { VFC } from "react";
import { Patch } from "../theme";

export const ThemePatch: VFC<{ data: Patch }> = ({ data }) => {
  return (
    <PanelSectionRow>
      <DropdownItem
        rgOptions={data.options.map((x, i) => {
          return { data: i, label: x };
        })}
        label={`${data.name} of ${data.theme.name}`}
        selectedOption={data.index}
        onChange={(index) => {
          data.index = index.data;
          data.value = index.label;
          python.execute(
            python.setPatchOfTheme(data.theme.name, data.name, data.value)
          );
        }}
      />
    </PanelSectionRow>
  );
};
