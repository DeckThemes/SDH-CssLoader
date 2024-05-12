import { DialogButton, Focusable, PanelSectionRow } from "decky-frontend-lib";
import { LocalThemeStatus, Theme } from "../../ThemeTypes";
import { useCssLoaderState } from "../../state";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { PartialCSSThemeInfo } from "../../apiTypes";
import { FaCheck, FaCloud } from "react-icons/fa6";

export function FullscreenCloudProfileEntry({
  data: e,
  handleUninstall,
  isInstalling,
  handleUpdate,
}: {
  data: PartialCSSThemeInfo & { isPrivate?: boolean };
  handleUninstall: (e: Theme | PartialCSSThemeInfo) => void;
  handleUpdate: (e: Theme | PartialCSSThemeInfo) => void;
  isInstalling: boolean;
}) {
  const { updateStatuses } = useCssLoaderState();

  // If it's null, that means it's cloud-only, not installed
  let updateStatus: LocalThemeStatus | null = null;
  const themeArrPlace = updateStatuses.find((f) => f[0] === e.id);
  if (themeArrPlace) {
    updateStatus = themeArrPlace[1];
  }

  const isOutdated = updateStatus === "outdated";
  const isInstalled = updateStatus !== null;

  return (
    <PanelSectionRow>
      <div
        style={{
          display: "flex",
          padding: "0",
          alignItems: "center",
          gap: "0.25em",
        }}
      >
        <span>{e.displayName}</span>
        {!isInstalled ? <FaCloud /> : <FaCheck />}
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
          {(isOutdated || !isInstalled) && (
            <DialogButton
              style={{
                marginRight: !isInstalled ? "0" : "8px",
                marginLeft: !isInstalled ? "auto" : "0",
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
          {/* Only show delete button if it IS installed */}
          {isInstalled && (
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
          )}
        </Focusable>
      </div>
    </PanelSectionRow>
  );
}
