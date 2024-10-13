import { ThemePatchComponent } from "@/types";
import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { ButtonItem, ColorPickerModal, PanelSectionRow, showModal } from "@decky/ui";
import { FaFolder } from "react-icons/fa";
import { FileSelectionType, openFilePicker } from "@decky/api";
import Color from "color";

export function ThemePatchComponent({
  component,
  currentPatchValue,
  patchName,
  themeName,
  shouldHaveBottomSeparator,
}: {
  component: ThemePatchComponent;
  currentPatchValue?: string;
  patchName: string;
  themeName: string;
  shouldHaveBottomSeparator: boolean;
}) {
  const bottomSeparatorValue = shouldHaveBottomSeparator ? "standard" : "none";

  const setComponentValue = useCSSLoaderAction("setComponentValue");
  const themeRootPath = useCSSLoaderValue("themeRootPath");
  const toast = useCSSLoaderAction("toast");
  if (currentPatchValue !== component.on) return null;

  function onValueChange(value: string) {
    void setComponentValue(themeName, patchName, component.name, value);
  }

  async function handleImagePicker() {
    // TODO: GATE BY FILE EXTENSION
    try {
      const filePickerRes = await openFilePicker(FileSelectionType.FILE, themeRootPath);
      if (!filePickerRes.path.includes(themeRootPath)) {
        throw new Error("Images must be within themes folder");
      }
      if (!/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(filePickerRes.path)) {
        throw new Error("Invalid File Type");
      }
      const relativePath = filePickerRes.path.split(`${themeRootPath}/`)[1];
      onValueChange(relativePath);
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      }
    }
  }

  function handleColorPicker() {
    const curColorHSLArray = Color(component.value).hsl().array();
    showModal(
      // @ts-expect-error
      <ColorPickerModal
        defaultH={curColorHSLArray[0]}
        defaultS={curColorHSLArray[1]}
        defaultL={curColorHSLArray[2]}
        defaultA={curColorHSLArray[3] ?? 1}
        onConfirm={(hslString) => {
          onValueChange(hslString);
        }}
      />
    );
  }

  return (
    <PanelSectionRow>
      <ButtonItem
        bottomSeparator={bottomSeparatorValue}
        layout="below"
        onClick={component.type === "image-picker" ? handleImagePicker : handleColorPicker}
      >
        <div className="flex items-center">
          <span>Open {component.name}</span>
          <div
            className="cl-qam-component-icon-container"
            style={component.type === "color-picker" ? { backgroundColor: "#000" } : {}}
          >
            {component.type === "color-picker" ? (
              <div
                className="cl-qam-component-color-preview"
                style={{ backgroundColor: Color(component.value).hsl().string() }}
              />
            ) : (
              <FaFolder />
            )}
          </div>
        </div>
      </ButtonItem>
    </PanelSectionRow>
  );
}
