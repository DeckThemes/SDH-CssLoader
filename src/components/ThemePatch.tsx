import { DropdownItem, PanelSectionRow, SliderField, ToggleField } from "decky-frontend-lib";
import * as python from "../python";
import { useState, VFC } from "react";
import { Patch } from "../ThemeTypes";
import { PatchComponent } from "./PatchComponent";
import { useCssLoaderState } from "../state";

export const ThemePatch: VFC<{
  data: Patch;
  index: number;
  fullArr: Patch[];
  themeName: string;
}> = ({ data, index, fullArr, themeName }) => {
  const { selectedPreset } = useCssLoaderState();
  const [selectedIndex, setIndex] = useState(data.options.indexOf(data.value));

  const [selectedLabel, setLabel] = useState(data.value);

  const bottomSeparatorValue = fullArr.length - 1 === index ? "standard" : "none";

  async function setPatchValue(value: string) {
    await python.setPatchOfTheme(themeName, data.name, value);
    // This was before all currently toggled themes were part of a dependency, this (and probably lots of the other preset code) can be changed to assume that by default
    if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
      return python.generatePresetFromThemeNames(selectedPreset.name, selectedPreset.dependencies);
    }
    return;
  }

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
              label={<PatchLabel name={data.name} />}
              min={0}
              max={data.options.length - 1}
              value={selectedIndex}
              onChange={(value) => {
                setPatchValue(data.options[value]);
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
              label={<PatchLabel name={data.name} />}
              checked={data.value === "Yes"}
              onChange={(bool) => {
                const newValue = bool ? "Yes" : "No";
                setPatchValue(newValue);
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
              label={<PatchLabel name={data.name} />}
              menuLabel={`${data.name}`}
              rgOptions={data.options.map((x, i) => {
                return { data: i, label: x };
              })}
              selectedOption={selectedIndex}
              onChange={(index) => {
                setIndex(index.data);
                data.value = index.label as string;
                setLabel(data.value);
                setPatchValue(data.value);
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
            <PatchLabel name={data.name} />
          </PanelSectionRow>
          <ComponentWrapper />
        </>
      );
    default:
      return null;
  }
};

const PatchLabel = ({ name }: { name: string }) => {
  return (
    <div
      className="DialogLabel"
      style={{
        marginBottom: "0px",
      }}
    >
      {name}
    </div>
  );
};
