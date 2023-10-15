import { DialogButton, Focusable, ConfirmModal } from "decky-frontend-lib";
import { Theme } from "../ThemeTypes";
import { setNavPatch } from "./NavPatch";
export function NavPatchInfoModalRoot({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal?: any;
}) {
  function onButtonClick() {
    setNavPatch(true, true);
    closeModal();
  }
  return (
    <ConfirmModal
      strTitle="Enable Nav Patch?"
      onOK={onButtonClick}
      strCancelButtonText="Don't Enable"
      strOKButtonText="Enable (Recommended)"
      onCancel={closeModal}
      onEscKeypress={closeModal}
    >
      <span style={{ marginBottom: "10px" }}>
        {themeData.name} hides elements that can be selected using a controller. For this to work
        correctly, CSS Loader needs to patch controller navigation. Not enabling this feature will
        cause visually hidden elements to be able to be selected using a controller.
      </span>
    </ConfirmModal>
  );
}
