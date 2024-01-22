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

export function UploadProfileModalRoot({ closeModal }: { closeModal?: any }) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={python.globalState}>
        <UploadProfileModal />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

function UploadProfileModal() {
  const { localThemeList } = useCssLoaderState();
  let [selectedProfile, setProfile] = useState(
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
      <ButtonItem>
        <span>Upload</span>
      </ButtonItem>
    </Focusable>
  );
}
