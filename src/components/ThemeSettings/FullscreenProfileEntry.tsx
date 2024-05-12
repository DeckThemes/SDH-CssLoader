import { DialogButton, Focusable, PanelSectionRow } from "decky-frontend-lib";
import { LocalThemeStatus, Theme } from "../../ThemeTypes";
import { useCssLoaderState } from "../../state";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

export function FullscreenProfileEntry({
  data: e,
  handleUninstall,
  isInstalling,
  handleUpdate,
}: {
  data: Theme;
  handleUninstall: (e: Theme) => void;
  handleUpdate: (e: Theme) => void;
  isInstalling: boolean;
}) {
  const { updateStatuses } = useCssLoaderState();
  let updateStatus: LocalThemeStatus = "installed";
  const themeArrPlace = updateStatuses.find((f) => f[0] === e.id);
  if (themeArrPlace) {
    updateStatus = themeArrPlace[1];
  }
  return (
    <PanelSectionRow>
      <div
        style={{
          display: "flex",
          padding: "0",
          alignItems: "center",
        }}
      >
        <span>{e.display_name}</span>
        <Focusable
          style={{
            display: "flex",
            marginLeft: "auto",
            position: "relative",
            minWidth: "60%",
            maxWidth: "60%",
          }}
        >
          {/* Update Button */}
          {updateStatus === "outdated" && (
            <DialogButton
              style={{
                marginRight: "8px",
                minWidth: "calc(50% - 8px)",
                maxWidth: "calc(50% - 8px)",
                filter: "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)",
              }}
              onClick={() => handleUpdate(e)}
              disabled={isInstalling}
            >
              <AiOutlineDownload />
            </DialogButton>
          )}
          <DialogButton
            style={{
              minWidth: "calc(50% - 8px)",
              maxWidth: "calc(50% - 8px)",
              marginLeft: "auto",
            }}
            onClick={() => handleUninstall(e)}
            disabled={isInstalling}
          >
            <FaTrash />
          </DialogButton>
        </Focusable>
      </div>
    </PanelSectionRow>
  );
}
