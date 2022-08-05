import {
  DropdownItem,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "decky-frontend-lib";
import * as python from "../python";
import { useState, VFC } from "react";
import { Patch } from "../theme";

export const ThemePatch: VFC<{
  data: Patch;
  index: number;
  fullArr: Patch[];
}> = ({ data, index, fullArr }) => {
  // For some reason, the other 2 don't require useStates, the slider does though.
  const [sliderValue, setSlider] = useState(data.index);

  const bottomSeparatorValue = fullArr.length - 1 === index ? undefined : false;

  switch (data.type) {
    case "slider":
      return (
        <PanelSectionRow>
          <SliderField
            bottomSeparator={bottomSeparatorValue}
            label={` ↳ ${data.name}`}
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
            bottomSeparator={bottomSeparatorValue}
            label={` ↳ ${data.name}`}
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
            bottomSeparator={bottomSeparatorValue}
            label={` ↳ ${data.name}`}
            menuLabel={`${data.name}`}
            rgOptions={data.options.map((x, i) => {
              return { data: i, label: x };
            })}
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
