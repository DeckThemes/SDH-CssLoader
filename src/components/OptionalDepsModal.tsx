import { ModalRoot } from "decky-frontend-lib";
import { DepsOptionSelector } from "./DepsOptionSelector";
import { Theme } from "../ThemeTypes";
import t from "../i18n/i18n";

export function OptionalDepsModalRoot({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal?: any;
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
        {t("DEPS_ENABLE_TITLE", "Enable dependencies for {name}?", { name: themeData.name })}
      </h1>
      <span style={{ marginBottom: "10px" }}>
        {t(
          "DEPS_ENABLE_DESC_1",
          "{name} enables optional themes to enhance this theme. Disabling these may break the theme, or make the theme look completely different. Specific optional themes can be configured and or enabled/disabled anytime via the Quick Access Menu.",
          { name: themeData.name }
        )}
      </span>
      <span style={{ marginBottom: "10px" }}>
        {t(
          "DEPS_ENABLE_DESC_2",
          "Enable with configuration will enable optional themes and apply their recommended configuration, Enable without configuration will keep existing configuration, and Enable only this theme will not enable any optional themes."
        )}
      </span>

      <DepsOptionSelector themeName={themeData.name} closeModal={closeModal} />
    </>
  );
}
