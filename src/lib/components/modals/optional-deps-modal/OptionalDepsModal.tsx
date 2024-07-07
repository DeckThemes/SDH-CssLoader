import { Theme } from "@/types";
import { Modal } from "../../../primitives";
import { DialogButton, Focusable } from "@decky/ui";

export function OptionalDepsModal({
  closeModal,
  theme,
  onSelect,
}: {
  closeModal?: () => void;
  theme: Theme;
  onSelect: (enableDeps: boolean, enableDepValues: boolean) => void;
}) {
  function handleChoice(enableDeps: boolean, enableDepValues: boolean) {
    onSelect(enableDeps, enableDepValues);
    closeModal?.();
  }

  return (
    <Modal closeModal={closeModal} title={`Enable dependencies for ${theme.display_name}`}>
      <div className="flex flex-col gap-4">
        <p>
          {theme.name} enables optional themes to enhance this theme. Disabling these may break the
          theme, or make the theme look completely different. Specific optional themes can be
          configured and or enabled/disabled anytime via the Quick Access Menu.
        </p>
        <p>
          <b>Enable without configuration</b> will enable optional themes but not overwrite their
          configuration, and <b>Enable only this theme</b> will not enable any optional themes.
        </p>
      </div>
      <Focusable style={{ display: "flex" }}>
        <DialogButton onClick={() => handleChoice(true, true)}>
          <span>Enable with configuration {"(Recommended)"}</span>
        </DialogButton>
        <DialogButton onClick={() => handleChoice(true, false)}>
          <span>Enable without configuration</span>
        </DialogButton>
        <DialogButton onClick={() => handleChoice(false, false)}>
          <span>Enable only this theme</span>
        </DialogButton>
      </Focusable>
    </Modal>
  );
}
