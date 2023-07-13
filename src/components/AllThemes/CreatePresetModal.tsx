import { ConfirmModal, TextField } from "decky-frontend-lib";
import { useState } from "react";
import * as python from "../../python";
import { CssLoaderContextProvider, useCssLoaderState } from "../../state";

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

export function CreatePresetModal({ closeModal }: { closeModal: () => void }) {
  const { localThemeList, selectedPreset } = useCssLoaderState();
  const [presetName, setPresetName] = useState<string>("");
  const enabledNumber = localThemeList.filter((e) => e.enabled).length;

  return (
    <ConfirmModal
      strTitle="Create Profile"
      strDescription={`This profile will combine all ${enabledNumber} themes you currently have enabled. Enabling/disabling it will toggle them all at once.`}
      strOKButtonText="Create"
      onCancel={closeModal}
      onOK={async () => {
        if (presetName.length === 0) {
          python.toast("No Name!", "Please add a name to your profile.");
          return;
        }
        // TODO: Potentially dont need 2 reloads here, not entirely sure
        await python.generatePreset(presetName);
        await python.reloadBackend();
        if (selectedPreset) {
          await python.setThemeState(selectedPreset?.name, false);
        }
        await python.setThemeState(presetName, true);
        await python.reloadBackend();

        closeModal();
      }}
    >
      <div style={{ marginBottom: "20px" }} />
      <TextField
        label="Profile Name"
        value={presetName}
        onChange={(e) => {
          setPresetName(e.target.value);
        }}
      />
    </ConfirmModal>
  );
}
