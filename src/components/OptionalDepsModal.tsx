import { ModalRoot } from "decky-frontend-lib";
import { DepsOptionSelector } from "./DepsOptionSelector";
import { Theme } from "../ThemeTypes";
export function OptionalDepsModalRoot({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal: any;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <OptionalDepsModal themeData={themeData} closeModal={closeModal} />
    </ModalRoot>
  );
}

export function OptionalDepsModal({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal: any;
}) {
  return (
    <>
      <h1
        style={{
          marginBlockEnd: "10px",
          marginBlockStart: "0px",
          overflowX: "hidden",
          fontSize: "1.5em",
          whiteSpace: "nowrap",
        }}
      >
        Enable dependencies for {themeData.name}?
      </h1>
      <span style={{ marginBottom: "10px" }}>
        {themeData.name} enables optional themes to enhance this theme. Disabling these may break
        the theme, or make the theme look completely different. Specific optional themes can be
        configured and or enabled/disabled anytime via the Quick Access Menu.
      </span>
      <span style={{ marginBottom: "10px" }}>
        <b>Enable without configuratiton</b> will enable optional themes but not overwrite their
        configuration, and <b>Enable only this theme</b> will not enable any optional themes.
      </span>

      <DepsOptionSelector themeName={themeData.name} closeModal={closeModal} />
    </>
  );
}
