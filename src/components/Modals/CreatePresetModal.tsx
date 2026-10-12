import { ConfirmModal, TextField } from "decky-frontend-lib";
import { useState } from "react";
import * as python from "../../python";
import { CssLoaderContextProvider, useCssLoaderState } from "../../state";
import t from "../../i18n/i18n";

export function CreatePresetModalRoot({ closeModal }: { closeModal: any }) {
  return (
    <>
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={python.globalState}>
        <CreatePresetModal closeModal={closeModal} />
      </CssLoaderContextProvider>
    </>
  );
}

function CreatePresetModal({ closeModal }: { closeModal: () => void }) {
  const { localThemeList, selectedPreset } = useCssLoaderState();
  const [presetName, setPresetName] = useState<string>("");
  const enabledNumber = localThemeList.filter((e) => e.enabled).length;

  return (
    <ConfirmModal
      strTitle={t("CREATE_PROFILE_TITLE", "Create Profile")}
      strDescription={t(
        "CREATE_PROFILE_DESC",
        "This profile will combine all {count} themes you currently have enabled. Enabling/disabling it will toggle them all at once.",
        { count: enabledNumber }
      )}
      strOKButtonText={t("CREATE_PROFILE_BTN", "Create")}
      onCancel={closeModal}
      onOK={async () => {
        if (presetName.length === 0) {
          python.toast(
            t("TOAST_NO_NAME_TITLE", "No Name!"),
            t("TOAST_NO_NAME_DESC", "Please add a name to your profile.")
          );
          return;
        }
        // TODO: Potentially dont need 2 reloads here, not entirely sure
        await python.generatePreset(presetName);
        await python.reloadBackend();
        if (selectedPreset) {
          await python.setThemeState(selectedPreset?.name, false);
        }
        await python.setThemeState(presetName + ".profile", true);
        await python.getInstalledThemes();
        closeModal();
      }}
    >
      <div style={{ marginBottom: "20px" }} />
      <TextField
        label={t("PROFILE_NAME_LABEL", "Profile Name")}
        value={presetName}
        onChange={(e) => {
          setPresetName(e.target.value);
        }}
      />
    </ConfirmModal>
  );
}
