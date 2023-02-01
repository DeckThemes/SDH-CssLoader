import { ConfirmModal, TextField } from "decky-frontend-lib";
import { useState } from "react";
import * as python from "../python";

export function CreatePresetModal({
  closeModal,
  enabledNumber,
}: {
  closeModal: () => void;
  enabledNumber: number;
}) {
  const [presetName, setPresetName] = useState<string>("");

  return (
    <ConfirmModal
      strTitle="Create Preset"
      strDescription={`This preset will combine all ${enabledNumber} themes you currently have enabled. Enabling/disabling it will toggle them all at once.`}
      strOKButtonText="Create"
      onCancel={closeModal}
      onOK={() => {
        if (presetName.length === 0) {
          python.toast("No Name!", "Please add a name to your preset.");
          return;
        }
        python.generatePreset(presetName).then(() => {
          python.reloadBackend().then(() => {
            closeModal();
          });
        });
      }}
    >
      <div style={{ marginBottom: "20px" }} />
      <TextField
        label="Preset Name"
        value={presetName}
        onChange={(e) => {
          setPresetName(e.target.value);
        }}
      />
    </ConfirmModal>
  );
}
