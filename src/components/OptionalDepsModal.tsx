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
      <span>
        {themeData.name} is intended to depend on other themes, but the author has marked them as
        optional.
      </span>
      <DepsOptionSelector themeName={themeData.name} closeModal={closeModal} />
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            closeModal();
          }}
        >
          Close
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}
