import {
  DropdownItem,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "decky-frontend-lib";
import * as python from "../python";
import { useState, VFC } from "react";
import { Patch } from "../theme";
import { PatchComponent } from "./PatchComponent";

export const ThemePatch: VFC<{
  data: Patch;
  index: number;
  fullArr: Patch[];
}> = ({ data, index, fullArr }) => {
  // For some reason, the other 2 don't require useStates, the slider does though.
  const [sliderValue, setSlider] = useState(data.index);

  const [selectedLabel, setLabel] = useState(data.value);

  const bottomSeparatorValue =
    fullArr.length - 1 === index ? "standard" : "none";

  switch (data.type) {
    case "slider":
      return (
        <>
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
                setLabel(data.options[value]);

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
          {data.components.length > 0 ? (
            <>
              {data.components.map((e) => (
                <PatchComponent
                  data={e}
                  selectedLabel={selectedLabel}
                  themeName={data.theme.name}
                  patchName={data.name}
                  bottomSeparatorValue={bottomSeparatorValue}
                />
              ))}
            </>
          ) : null}
        </>
      );
    case "checkbox":
      return (
        <>
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
                setLabel(newValue);
                data.index = data.options.findIndex((e) => e === newValue);
                data.value = newValue;
              }}
            />
          </PanelSectionRow>
          {data.components.length > 0 ? (
            <>
              {data.components.map((e) => (
                <PatchComponent
                  data={e}
                  selectedLabel={selectedLabel}
                  themeName={data.theme.name}
                  patchName={data.name}
                  bottomSeparatorValue={bottomSeparatorValue}
                />
              ))}
            </>
          ) : null}
        </>
      );
    case "dropdown":
      return (
        <>
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
                data.value = index.label as string;
                setLabel(data.value);
                python.execute(
                  python.setPatchOfTheme(data.theme.name, data.name, data.value)
                );
              }}
            />
          </PanelSectionRow>
          {data.components.length > 0 ? (
            <>
              {data.components.map((e) => (
                <PatchComponent
                  data={e}
                  selectedLabel={selectedLabel}
                  themeName={data.theme.name}
                  patchName={data.name}
                  bottomSeparatorValue={bottomSeparatorValue}
                />
              ))}
            </>
          ) : null}
        </>
      );
    case "none":
      return (
        <>
          <PanelSectionRow>
            {/* For some reason spans by default have a gray color, so I manually set it to the same white as the other titles */}
            <span style={{ color: "#dcdedf" }}>↳ {data.name}</span>
          </PanelSectionRow>
          {data.components.length > 0 ? (
            <>
              {data.components.map((e) => (
                <PatchComponent
                  data={e}
                  selectedLabel={selectedLabel}
                  themeName={data.theme.name}
                  patchName={data.name}
                  bottomSeparatorValue={bottomSeparatorValue}
                />
              ))}
            </>
          ) : null}
        </>
      );
    default:
      return null;
  }
};
