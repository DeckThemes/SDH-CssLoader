import { Patch } from "@/types";
import { useCSSLoaderAction, useCSSLoaderStateValue } from "@/backend";
import { useState } from "react";
import { DropdownItem, PanelSectionRow, SliderField, ToggleField } from "@decky/ui";
import { ThemePatchComponent } from "./ThemePatchComponent";

const modal = false;

export function ThemePatch({
  patch,
  shouldHaveBottomSeparator,
  themeName,
}: {
  patch: Patch;
  shouldHaveBottomSeparator: boolean;
  themeName: string;
}) {
  const bottomSeparatorValue = shouldHaveBottomSeparator ? "standard" : "none";

  const setPatchValue = useCSSLoaderAction("setPatchValue");

  const [selectedValueIndex, setSelectedValueIndex] = useState(patch.options.indexOf(patch.value));

  function onValueChange(value: string) {
    const index = patch.options.indexOf(value);
    setSelectedValueIndex(index);
    // I vaguely remember this fixing some optimistic state update issue
    patch.value = value;
    void setPatchValue(themeName, patch.name, value);
  }

  return (
    <>
      <PanelSectionRow>
        {patch.type === "slider" && (
          <SliderField
            bottomSeparator={bottomSeparatorValue}
            label={modal ? patch.name : <PatchLabel name={patch.name} />}
            min={0}
            max={patch.options.length - 1}
            value={selectedValueIndex}
            notchCount={patch.options.length}
            notchLabels={patch.options.map((option, index) => ({
              notchIndex: index,
              label: option,
              value: index,
            }))}
            onChange={(index) => {
              onValueChange(patch.options[index]);
            }}
          />
        )}
        {patch.type === "checkbox" && (
          <ToggleField
            bottomSeparator={bottomSeparatorValue}
            label={modal ? patch.name : <PatchLabel name={patch.name} />}
            checked={patch.value === "Yes"}
            onChange={(value) => {
              // TODO: TEST THIS
              const newValue = value ? "Yes" : "No";
              onValueChange(newValue);
            }}
          />
        )}
        {patch.type === "dropdown" && (
          <DropdownItem
            bottomSeparator={bottomSeparatorValue}
            label={modal ? patch.name : <PatchLabel name={patch.name} />}
            menuLabel={patch.name}
            rgOptions={patch.options.map((option, index) => ({ label: option, data: index }))}
            selectedOption={selectedValueIndex}
            onChange={(value) => {
              onValueChange(value.label as string);
            }}
          />
        )}
        {patch.type === "none" && (
          <>
            {modal ? (
              <span style={{ color: "#dcdedf" }}>{patch.name}</span>
            ) : (
              <PatchLabel name={patch.name} />
            )}
          </>
        )}
      </PanelSectionRow>
      {patch.components.map((component) => (
        <ThemePatchComponent
          key={component.name}
          component={component}
          themeName={themeName}
          patchName={patch.name}
          shouldHaveBottomSeparator={shouldHaveBottomSeparator}
        />
      ))}
    </>
  );
}

// TODO: IS THIS NEEDED?
function PatchLabel({ name }: { name: string }) {
  return <div className="DialogLabel mb-0">{name}</div>;
}
