import { ModalRoot, SliderField } from "decky-frontend-lib";
import { CSSProperties, useState, VFC } from "react";

interface ColorPickerModalProps {
  closeModal: () => void;
  onConfirm?(HSLString: string): any;
  title?: string;
  defaultH?: number;
  defaultS?: number;
  defaultL?: number;
  defaultA?: number;
}

export const ColorPickerModal: VFC<ColorPickerModalProps> = ({
  closeModal,
  onConfirm = () => {},
  title = "Color Picker",
  defaultH = 0,
  defaultS = 100,
  defaultL = 50,
  defaultA = 1,
}) => {
  const [H, setH] = useState<number>(defaultH);
  const [S, setS] = useState<number>(defaultS);
  const [L, setL] = useState<number>(defaultL);
  const [A, setA] = useState<number>(defaultA);

  const colorPickerCSSVars = {
    "--decky-color-picker-hvalue": `${H}`,
    "--decky-color-picker-svalue": `${S}%`,
    "--decky-color-picker-lvalue": `${L}%`,
    "--decky-color-picker-avalue": `${A}`,
  } as CSSProperties;
  return (
    <>
      <style>
        {`
        /* This removes the cyan track color that is behind the slider head */
        .ColorPicker_Container .gamepadslider_SliderTrack_Mq25N {
          --left-track-color: #0000;
          /* This is for compatibility with the "Colored Toggles" CSSLoader Theme*/
          --colored-toggles-main-color: #0000;
        }

        .ColorPicker_HSlider .gamepadslider_SliderTrack_Mq25N {
          background: linear-gradient(
            270deg,
            hsla(360, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(270, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(180, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(90, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(0, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_SSlider .gamepadslider_SliderTrack_Mq25N {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), 0%, var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), 100%, var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_LSlider .gamepadslider_SliderTrack_Mq25N {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 0%, var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 50%, var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 100%, var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_ASlider .gamepadslider_SliderTrack_Mq25N {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), 0),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), 1)
          );
        }
        `}
      </style>
      <ModalRoot
        bAllowFullSize
        onCancel={closeModal}
        onOK={() => {
          onConfirm(`hsla(${H}, ${S}%, ${L}%, ${A})`);
          closeModal();
        }}
      >
        <div
          className="ColorPicker_ColorDisplayContainer"
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
              <b>{title}</b>
            </span>
          </div>
          <div
            style={{
              backgroundColor: `hsla(${H}, ${S}%, ${L}%, ${A})`,
              width: "40px",
              height: "40px",
            }}
          ></div>
        </div>
        <div className="ColorPicker_Container" style={colorPickerCSSVars}>
          <div className="ColorPicker_HSlider">
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
          <div className="ColorPicker_SSlider">
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
          <div className="ColorPicker_LSlider">
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
          <div className="ColorPicker_ASlider">
            <SliderField
              showValue
              editableValue
              label="Alpha"
              value={A}
              step={0.1}
              min={0}
              max={1}
              onChange={setA}
            />
          </div>
        </div>
      </ModalRoot>
    </>
  );
};
