import { DialogButton, Focusable } from "decky-frontend-lib";
import * as python from "../python";
import t from "../i18n/i18n";

export function DepsOptionSelector({
  themeName,
  closeModal = undefined,
}: {
  themeName: string;
  closeModal?: any;
}) {
  function enableTheme(enableDeps: boolean = true, enableDepValues: boolean = true) {
    python.resolve(python.setThemeState(themeName, true, enableDeps, enableDepValues), () => {
      python.getInstalledThemes();
      closeModal && closeModal();
    });
  }
  return (
    <Focusable style={{ display: "flex" }}>
      <DialogButton onClick={() => enableTheme(true, true)} style={{ margin: "0 10px" }}>
        <span>{t("DEPS_ENABLE_WITH_CONFIG", "Enable with configuration (Recommended)")}</span>
      </DialogButton>
      <DialogButton onClick={() => enableTheme(true, false)} style={{ margin: "0 10px" }}>
        <span>{t("DEPS_ENABLE_WITHOUT_CONFIG", "Enable without configuration")}</span>
      </DialogButton>
      <DialogButton onClick={() => enableTheme(false, false)} style={{ margin: "0 10px" }}>
        <span>{t("DEPS_ENABLE_ONLY_THIS", "Enable only this theme")}</span>
      </DialogButton>
    </Focusable>
  );
}
