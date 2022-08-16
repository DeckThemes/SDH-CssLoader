import { ModalRoot, SliderField } from "decky-frontend-lib";
import { useState, VFC } from "react";

import * as python from "../python";

export const ColorPickerModal: VFC<{
  setThemeList: any;
  closeModal: any;
  curColorArr: number[];
  themeName: string;
  patchName: string;
  componentName: string;
}> = ({
  closeModal,
  setThemeList,
  curColorArr,
  themeName,
  patchName,
  componentName,
}) => {
  const [H, setH] = useState<number>(curColorArr[0] || 0);
  const [S, setS] = useState<number>(curColorArr[1] || 100);
  const [L, setL] = useState<number>(curColorArr[2] || 50);

  return (
    <>
      <style>
        {/* refer to "colorpicker.css" to see how these variables are used, they're for dynamically changing the slider bgs */}
        {`
        :root {
          --cssloader-hvalue: ${H};
          --cssloader-svalue: ${S}%;
          --cssloader-lvalue: ${L}%;
        }
        `}
      </style>
      <ModalRoot
        bAllowFullSize
        onCancel={closeModal}
        onOK={() => {
          const HSLString = `hsl(${H}, ${S}%, ${L}%)`;
          python.resolve(
            python.setComponentOfThemePatch(
              themeName,
              patchName,
              componentName,
              HSLString
            ),
            () => {
              closeModal();
              python.resolve(python.getThemes(), setThemeList);
            }
          );
        }}
      >
        <div
          className="CSSLoader_ColorPicker_ColorDisplayContainer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1em",
            // theres a large header by default on the modal, so this just pushes it up into that unused space
            marginTop: "-2.5em",
          }}
        >
          <div>
            <span style={{ fontSize: "1.5em" }}>
              <b>Color Picker </b>
            </span>
          </div>
          <div
            style={{
              backgroundColor: `hsl(${H}, ${S}%, ${L}%)`,
              width: "40px",
              height: "40px",
            }}
          ></div>
        </div>
        <div className="CSSLoader_ColorPicker_Container">
          <div className="CSSLoader_ColorPicker_HSlider">
            <SliderField
              showValue
              editableValue
              label="Hue"
              value={H}
              min={0}
              max={360}
              onChange={setH}
            />
          </div>
          <div className="CSSLoader_ColorPicker_SSlider">
            <SliderField
              showValue
              editableValue
              label="Saturation"
              value={S}
              min={0}
              max={100}
              onChange={setS}
            />
          </div>
          <div className="CSSLoader_ColorPicker_LSlider">
            <SliderField
              showValue
              editableValue
              label="Lightness"
              value={L}
              min={0}
              max={100}
              onChange={setL}
            />
          </div>
        </div>
      </ModalRoot>
    </>
  );
};
