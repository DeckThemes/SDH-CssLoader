import { CssLoaderContextProvider } from "../../state";
import * as python from "../../python";
import { ConfirmModal, ModalRoot } from "decky-frontend-lib";
import t from "../../i18n/i18n";

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
      strTitle={t("DELETE_CONFIRM_TITLE", "Delete Themes")}
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
      {themesToBeDeleted.length === 1
        ? t("DELETE_CONFIRM_SINGLE", "Are you sure you want to delete this theme?")
        : t("DELETE_CONFIRM_MULTI", "Are you sure you want to delete these {count} themes?", {
            count: themesToBeDeleted.length,
          })}
    </div>
  );
}
