import { DialogButton, Focusable, ToggleField, showModal } from "decky-frontend-lib";
import { LocalThemeStatus, Theme } from "../../ThemeTypes";
import { useCssLoaderState } from "../../state";
import * as python from "../../python";
import { ImCog } from "react-icons/im";
import { AiFillEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toggleTheme } from "../../backend/backendHelpers/toggleTheme";
import { ThemeSettingsModalRoot } from "../Modals/ThemeSettingsModal";
import { FaTrash } from "react-icons/fa";

export function FullscreenSingleThemeEntry({
  data: e,
  showModalButtonPrompt = false,
  handleUninstall,
  handleUpdate,
  isInstalling,
}: {
  data: Theme;
  showModalButtonPrompt?: boolean;
  handleUninstall: (e: Theme) => void;
  handleUpdate: (e: Theme) => void;
  isInstalling: boolean;
}) {
  const { unpinnedThemes, updateStatuses } = useCssLoaderState();
  const isPinned = !unpinnedThemes.includes(e.id);

  let [updateStatus]: [LocalThemeStatus] = ["installed"];
  const themeArrPlace = updateStatuses.find((f) => f[0] === e.id);
  if (themeArrPlace) {
    updateStatus = themeArrPlace[1];
  }

  // I extracted these here as doing conditional props inline sucks
  const modalButtonProps = showModalButtonPrompt
    ? {
        onOptionsActionDescription: "Expand Settings",
        onOptionsButton: () => {
          showModal(<ThemeSettingsModalRoot selectedTheme={e.id} />);
        },
      }
    : {};

  const updateButtonProps =
    updateStatus === "outdated"
      ? {
          onSecondaryButton: () => {
            handleUpdate(e);
          },
          onSecondaryActionDescription: "Update Theme",
        }
      : {};

  return (
    <>
      <div className="CSSLoader_FullTheme_EntryContainer">
        {updateStatus === "outdated" && (
          <div
            style={{
              position: "absolute",
              left: "-1em",
              top: "50%",
              transform: "translate(0,-50%)",
              width: "0.5em",
              height: "0.5em",
              backgroundColor: "#fca904",
              borderRadius: "100%",
            }}
          ></div>
        )}
        <Focusable
          {...modalButtonProps}
          {...updateButtonProps}
          className="CSSLoader_FullTheme_ToggleContainer"
        >
          <ToggleField
            disabled={isInstalling}
            bottomSeparator="none"
            label={<span className="CSSLoader_FullTheme_ThemeLabel">{e.display_name}</span>}
            checked={e.enabled}
            onChange={(switchValue: boolean) => {
              toggleTheme(e, switchValue);
            }}
          />
        </Focusable>
        <DialogButton
          disabled={isInstalling}
          className="CSSLoader_FullTheme_DialogButton"
          onClick={() => {
            if (isPinned) {
              python.unpinTheme(e.id);
            } else {
              python.pinTheme(e.id);
            }
          }}
        >
          {isPinned ? (
            <AiFillEye className="CSSLoader_FullTheme_IconTranslate" />
          ) : (
            <AiOutlineEyeInvisible className="CSSLoader_FullTheme_IconTranslate" />
          )}
        </DialogButton>
        <DialogButton
          disabled={isInstalling}
          className="CSSLoader_FullTheme_DialogButton"
          onClick={() => {
            showModal(<ThemeSettingsModalRoot selectedTheme={e.id} />);
          }}
        >
          <ImCog className="CSSLoader_FullTheme_IconTranslate" />
        </DialogButton>
      </div>
    </>
  );
}
