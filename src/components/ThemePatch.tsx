import { DropdownItem, PanelSectionRow, SliderField, ToggleField } from "decky-frontend-lib";
import * as python from "../python";
import { useState, VFC } from "react";
import { Patch } from "../ThemeTypes";
import { PatchComponent } from "./PatchComponent";

export const ThemePatch: VFC<{
  data: Patch;
  index: number;
  fullArr: Patch[];
  themeName: string;
}> = ({ data, index, fullArr, themeName }) => {
  const [selectedIndex, setIndex] = useState(data.options.indexOf(data.value));

  const [selectedLabel, setLabel] = useState(data.value);

  const bottomSeparatorValue = fullArr.length - 1 === index ? "standard" : "none";

  function ComponentWrapper() {
    return (
      <>
        {data.components.length > 0 ? (
          <>
            {data.components.map((e) => (
              <PatchComponent
                data={e}
                selectedLabel={selectedLabel}
                themeName={themeName}
                patchName={data.name}
                bottomSeparatorValue={bottomSeparatorValue}
              />
            ))}
          </>
        ) : null}
      </>
    );
  }

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
              value={selectedIndex}
              onChange={(value) => {
                python.execute(python.setPatchOfTheme(themeName, data.name, data.options[value]));
                setIndex(value);
                setLabel(data.options[value]);
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
          <ComponentWrapper />
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
                python.execute(python.setPatchOfTheme(themeName, data.name, newValue));
                setLabel(newValue);
                setIndex(data.options.findIndex((e) => e === newValue));
                data.value = newValue;
              }}
            />
          </PanelSectionRow>
          <ComponentWrapper />
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
              selectedOption={selectedIndex}
              onChange={(index) => {
                setIndex(index.data);
                data.value = index.label as string;
                setLabel(data.value);
                python.execute(python.setPatchOfTheme(themeName, data.name, data.value));
              }}
            />
          </PanelSectionRow>
          <ComponentWrapper />
        </>
      );
    case "none":
      return (
        <>
          <PanelSectionRow>
            {/* For some reason spans by default have a gray color, so I manually set it to the same white as the other titles */}
            <span style={{ color: "#dcdedf" }}>↳ {data.name}</span>
          </PanelSectionRow>
          <ComponentWrapper />
        </>
      );
    default:
      return null;
  }
};
