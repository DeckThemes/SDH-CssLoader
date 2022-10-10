import { VFC } from "react";

import * as python from "../python";

import { showModal, ButtonItem, PanelSectionRow } from "decky-frontend-lib";

import { ColorPickerModal } from "decky-frontend-lib";
import { themePatchComponent } from "../theme";
import { useCssLoaderState } from "../state";
import { anythingToHSLA } from "../logic";

export const PatchComponent: VFC<{
  data: themePatchComponent;
  selectedLabel: string;
  themeName: string;
  patchName: string;
  bottomSeparatorValue: "standard" | "none";
}> = ({ data, selectedLabel, themeName, patchName, bottomSeparatorValue }) => {
  if (selectedLabel === data.on) {
    const { setLocalThemeList: setThemeList } = useCssLoaderState();
    // The only value that changes from component to component is the value, so this can just be re-used
    function setComponentAndReload(value: string) {
      python.resolve(
        python.setComponentOfThemePatch(
          themeName,
          patchName,
          data.name, // componentName
          value
        ),
        () => {
          python.resolve(python.getThemes(), setThemeList);
        }
      );
    }
    switch (data.type) {
      case "image-picker":
        // This makes things compatible with people using HoloISO or who don't have the user /deck/
        function getRootPath() {
          python.resolve(python.fetchThemePath(), (path: string) =>
            pickImage(path)
          );
        }
        // These have to
        async function pickImage(rootPath: string) {
          const res = await python.openFilePicker(rootPath);
          if (!res.path.includes(rootPath)) {
            python.toast("Invalid File", "Images must be within themes folder");
            return;
          }
          if (!/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(res.path)) {
            python.toast("Invalid File", "Must be an image file");
            return;
          }
          const relativePath = res.path.split(`${rootPath}/`)[1];
          setComponentAndReload(relativePath);
        }
        return (
          <PanelSectionRow>
            <ButtonItem
              bottomSeparator={bottomSeparatorValue}
              onClick={() => getRootPath()}
              layout="below"
            >
              <span>Open {data.name}</span>
            </ButtonItem>
          </PanelSectionRow>
        );
      case "color-picker":
        const curColorHSLArray = anythingToHSLA(data.value);
        const hslString = `hsla(${curColorHSLArray[0]}, ${curColorHSLArray[1]}%, ${curColorHSLArray[2]}%, ${curColorHSLArray[3]})`;

        return (
          <>
            <PanelSectionRow>
              <ButtonItem
                bottomSeparator={bottomSeparatorValue}
                onClick={() =>
                  showModal(
                    // @ts-ignore -- showModal passes the closeModal function to this, but for some reason it's giving me a typescript error because I didn't explicitly pass it myself
                    <ColorPickerModal
                      onConfirm={(HSLString) => {
                        setComponentAndReload(HSLString);
                      }}
                      defaultH={curColorHSLArray[0]}
                      defaultS={curColorHSLArray[1]}
                      defaultL={curColorHSLArray[2]}
                      defaultA={curColorHSLArray[3]}
                      title={data.name}
                    />
                  )
                }
                layout={"below"}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>Open {data.name}</span>
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: hslString,
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </div>
                </div>
              </ButtonItem>
            </PanelSectionRow>
          </>
        );
    }
  }
  return null;
};
