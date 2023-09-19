import { CssLoaderContextProvider } from "../../state";
import * as python from "../../python";
import { ConfirmModal, ModalRoot } from "decky-frontend-lib";

export function DeleteConfirmationModalRoot({
  themesToBeDeleted,
  closeModal,
  leaveDeleteMode,
}: {
  themesToBeDeleted: string[];
  closeModal?: any;
  leaveDeleteMode?: () => void;
}) {
  async function deleteThemes() {
    for (let i = 0; i < themesToBeDeleted.length; i++) {
      await python.deleteTheme(themesToBeDeleted[i]);
    }
    await python.getInstalledThemes();
    leaveDeleteMode && leaveDeleteMode();
    closeModal();
  }

  return (
    <ConfirmModal
      strTitle="Delete Themes"
      onCancel={closeModal}
      onEscKeypress={closeModal}
      onOK={deleteThemes}
    >
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={python.globalState}>
        <DeleteConfirmationModal {...{ themesToBeDeleted }} />
      </CssLoaderContextProvider>
    </ConfirmModal>
  );
}

function DeleteConfirmationModal({ themesToBeDeleted }: { themesToBeDeleted: string[] }) {
  return (
    <div>
      Are you sure you want to delete{" "}
      {themesToBeDeleted.length === 1 ? `this theme` : `these ${themesToBeDeleted.length} themes`}?
    </div>
  );
}
