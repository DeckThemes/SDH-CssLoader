import {
  DropdownItem,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "decky-frontend-lib";
import * as python from "../python";
import { useState, VFC } from "react";
import { Patch } from "../theme";

export const ThemePatch: VFC<{ data: Patch }> = ({ data }) => {
  // For some reason, the other 2 don't require useStates, the slider does though.
  const [sliderValue, setSlider] = useState(data.index);

  switch (data.type) {
    case "slider":
      return (
        <PanelSectionRow>
          <SliderField
            label={`${data.name} of ${data.theme.name}`}
            min={0}
            max={data.options.length - 1}
            value={sliderValue}
            onChange={(value) => {
              python.execute(
                python.setPatchOfTheme(
                  data.theme.name,
                  data.name,
                  data.options[value]
                )
              );
              setSlider(value);

              data.index = value;
              data.value = data.options[value];
            }}
            notchCount={data.options.length}
            notchLabels={data.options.map((e, i) => ({
              notchIndex: i,
              label: e,
              value: i,
            }))}
          />
        </PanelSectionRow>
      );
    case "checkbox":
      return (
        <PanelSectionRow>
          <ToggleField
            indentLevel={10}
            label={`${data.name} of ${data.theme.name}`}
            checked={data.value === "Yes"}
            onChange={(bool) => {
              const newValue = bool ? "Yes" : "No";
              python.execute(
                python.setPatchOfTheme(data.theme.name, data.name, newValue)
              );
              data.index = data.options.findIndex((e) => e === newValue);
              data.value = newValue;
            }}
          />
        </PanelSectionRow>
      );
    default:
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
  }
};
