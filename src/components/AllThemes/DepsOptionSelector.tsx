import { DialogButton, Focusable } from "decky-frontend-lib";
import * as python from "../../python";

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
    <Focusable>
      <DialogButton onClick={() => enableTheme(true, true)}>
        <span>Enable And Configure Dependencies {"(Default)"}</span>
      </DialogButton>
      <DialogButton onClick={() => enableTheme(true, false)}>
        <span>Enable Dependencies Unconfigured</span>
      </DialogButton>
      <DialogButton onClick={() => enableTheme(false, false)}>
        <span>Don't Enable Dependencies</span>
      </DialogButton>
    </Focusable>
  );
}
