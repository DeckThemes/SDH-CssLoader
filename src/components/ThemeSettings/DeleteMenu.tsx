import {
  DialogButton,
  DialogCheckbox,
  Focusable,
  PanelSection,
  showModal,
} from "decky-frontend-lib";
import { Theme } from "../../ThemeTypes";
import { useState } from "react";
import { DeleteConfirmationModalRoot } from "../Modals/DeleteConfirmationModal";

export function DeleteMenu({
  themeList,
  leaveDeleteMode,
}: {
  themeList: Theme[];
  leaveDeleteMode: () => void;
}) {
  let [choppingBlock, setChoppingBlock] = useState<string[]>([]); // name arr
  return (
    <Focusable>
      <PanelSection title="Delete Themes">
        {themeList.map((e) => (
          <div>
            <DialogCheckbox
              onChange={(checked) => {
                if (checked) {
                  setChoppingBlock([...choppingBlock, e.name]);
                } else {
                  setChoppingBlock(choppingBlock.filter((f) => f !== e.name));
                }
              }}
              checked={choppingBlock.includes(e.name)}
              label={e.name}
            />
          </div>
        ))}
        <DialogButton
          className="CSSLoader_DeleteThemes_DeleteButton"
          onClick={() => {
            showModal(
              <DeleteConfirmationModalRoot
                themesToBeDeleted={choppingBlock}
                leaveDeleteMode={leaveDeleteMode}
              />
            );
          }}
        >
          Delete
        </DialogButton>
      </PanelSection>
    </Focusable>
  );
}
