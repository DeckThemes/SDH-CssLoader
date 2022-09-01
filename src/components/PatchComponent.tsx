import { VFC } from "react";

import * as python from "../python";

import { showModal, ButtonItem, PanelSectionRow } from "decky-frontend-lib";

import { ColorPickerModal } from "./ColorPickerModal";
import { themePatchComponent } from "../theme";
import { useCssLoaderState } from "../state";
import { anythingToHSLA } from "../logic";

export const PatchComponent: VFC<{
  data: themePatchComponent;
  selectedLabel: string;
  themeName: string;
  patchName: string;
  bottomSeparatorValue: boolean | undefined;
}> = ({ data, selectedLabel, themeName, patchName, bottomSeparatorValue }) => {
  if (selectedLabel === data.on) {
    // This is used by the ColorPickerModal, but im getting errors when I attempt to call it from that
    // I think it's because QAM and SP are different tabs
    const { setLocalThemeList: setThemeList } = useCssLoaderState();

    switch (data.type) {
      default:
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
                        python.resolve(
                          python.setComponentOfThemePatch(
                            themeName,
                            patchName,
                            data.name, // componentName
                            HSLString
                          ),
                          () => {
                            python.resolve(python.getThemes(), setThemeList);
                          }
                        );
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
