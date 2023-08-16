import { DialogButton, Focusable, ModalRoot } from "decky-frontend-lib";
import { Theme } from "../ThemeTypes";
import { disableNavPatch, enableNavPatch } from "./NavPatch";
export function NavPatchInfoModalRoot({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal?: any;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <NavPatchInfoModal themeData={themeData} closeModal={closeModal} />
    </ModalRoot>
  );
}

export function NavPatchInfoModal({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal: any;
}) {
  function onButtonClick(enable: boolean) {
    enable ? enableNavPatch() : disableNavPatch();
    closeModal();
  }
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
        Enable Nav Patch?
      </h1>
      <span style={{ marginBottom: "10px" }}>
        {themeData.name} works best with the Nav Patch. This ensures smooth navigation over elements
        that {themeData.name} has hidden. If you choose not to enable it, the theme will look the
        same visually, however oddities may occur while navigating around the UI.
      </span>

      <Focusable style={{ display: "flex" }}>
        <DialogButton onClick={() => onButtonClick(true)} style={{ margin: "0 10px" }}>
          <span>Enable {"(Recommended)"}</span>
        </DialogButton>
        <DialogButton onClick={() => onButtonClick(false)} style={{ margin: "0 10px" }}>
          <span>Disable</span>
        </DialogButton>
      </Focusable>
    </>
  );
}
