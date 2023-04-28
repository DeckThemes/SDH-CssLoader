import { ButtonItem, ModalRoot, PanelSectionRow } from "decky-frontend-lib";
import { DepsOptionSelector } from "./AllThemes";
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
      <h1 style={{ marginBlockEnd: "10px", marginBlockStart: "0px" }}>Enable dependencies for {themeData.name}?</h1>
      <span>
        {themeData.name} enables optional themes to enhance this theme. Disabling these may break the theme, or make the theme look completely different. Specific optional themes can be configured and or enabled/disabled anytime via the Quick Access Menu.
      </span>
      <ul>
        <li>
          <b>Enable with configuration</b> will enable and overwrite any existing configuration for optional themes. Recommended option.
        </li>
        <li>
          <b>Enable without configuration</b> will only enable the optional themes, leaving existing configuration intact.
        </li>
        <li>
          <b>Enable only this theme</b> will only enable this theme, without optional themes.
        </li>
      </ul>

      <DepsOptionSelector themeName={themeData.name} closeModal={closeModal} />
    </>
  );
}
