import { CssLoaderContextProvider, useCssLoaderState } from "../../state";
import * as python from "../../python";
import {
  ButtonItem,
  ConfirmModal,
  DropdownItem,
  Focusable,
  ModalRoot,
  TextField,
  ToggleField,
} from "decky-frontend-lib";
import { useMemo, useState } from "react";
import { Flags } from "../../ThemeTypes";
import { publishProfile } from "../../backend/apiHelpers/profileUploadingHelpers";
import { TaskStatus } from "../TaskStatus";

export function UploadProfileModalRoot({
  closeModal,
  onUploadFinish,
}: {
  closeModal?: any;
  onUploadFinish: () => void;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={python.globalState}>
        <UploadProfileModal closeModal={closeModal} onUploadFinish={onUploadFinish} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

function UploadProfileModal({
  closeModal,
  onUploadFinish,
}: {
  closeModal: () => void;
  onUploadFinish: () => void;
}) {
  const { localThemeList } = useCssLoaderState();
  const [selectedProfile, setProfile] = useState(
    localThemeList.find((e) => e.flags.includes(Flags.isPreset))?.id
  );
  const profiles = useMemo(() => {
    return localThemeList.filter((e) => e.flags.includes(Flags.isPreset));
  }, [localThemeList]);
  const eligibleProfiles = useMemo(() => {
    return profiles;
  }, [profiles]);

  const [isPublic, setPublic] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "submitting" | "taskStatus" | "completed"
  >("idle");
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  async function onUpload() {
    if (!selectedProfile) return;
    setUploadStatus("submitting");
    // eventually run the submit here
    const taskId = await publishProfile(
      localThemeList.find((e) => e.id === selectedProfile)!.name,
      isPublic,
      description
    );
    setUploadStatus("taskStatus");
    setTaskId(taskId);
  }

  function onTaskFinish(success: boolean) {
    setUploadStatus("completed");
    if (success) {
      closeModal();
      onUploadFinish();
    }
  }

  if (uploadStatus === "taskStatus" && taskId) {
    return <TaskStatus task={taskId} onFinish={onTaskFinish} />;
  }

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <span>Upload Profile</span>
      <DropdownItem
        selectedOption={selectedProfile}
        rgOptions={eligibleProfiles.map((e) => ({ data: e.id, label: e.display_name }))}
        onChange={(chosen) => {
          setProfile(chosen.data);
        }}
        label="Profile To Upload"
      />
      <ToggleField checked={isPublic} onChange={setPublic} label="Make Profile Public" />
      <TextField
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <ButtonItem onClick={onUpload}>
        <span>Upload</span>
      </ButtonItem>
    </Focusable>
  );
}
