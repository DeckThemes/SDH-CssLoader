import { DialogButton, Focusable, showModal } from "decky-frontend-lib";
import { LocalThemeStatus, Theme } from "../../../ThemeTypes";
import { FaDownload, FaEye, FaEyeSlash, FaRegStar, FaStar, FaTrashAlt } from "react-icons/fa";
import { DeleteConfirmationModalRoot } from "../DeleteConfirmationModal";
import { useCssLoaderState } from "../../../state";
import * as python from "../../../python";
import {
  genericGET,
  logInWithShortToken,
  refreshToken,
  toggleStar as apiToggleStar,
  installTheme,
} from "../../../api";
import { useState, useEffect } from "react";

export function ThemeSettingsModalButtons({
  themeData,
  closeModal,
}: {
  themeData: Theme;
  closeModal: () => void;
}) {
  const { unpinnedThemes, apiShortToken, apiFullToken, updateStatuses, setGlobalState } =
    useCssLoaderState();
  const isPinned = !unpinnedThemes.includes(themeData.id);
  const [starFetchLoaded, setStarFetchLoaded] = useState<boolean>(false);
  const [isStarred, setStarred] = useState<boolean>(false);
  const [blurButtons, setBlurButtons] = useState<boolean>(false);

  const [updateStatus, setUpdateStatus] = useState<LocalThemeStatus>("installed");
  useEffect(() => {
    if (!themeData) return;
    const themeArrPlace = updateStatuses.find((f) => f[0] === themeData.id);
    if (themeArrPlace) {
      setUpdateStatus(themeArrPlace[1]);
    }
  }, [themeData]);

  async function toggleStar() {
    if (apiFullToken) {
      setBlurButtons(true);
      const newToken = await refreshToken();
      if (themeData && newToken) {
        apiToggleStar(themeData.id, isStarred, newToken).then((bool) => {
          if (bool) {
            setStarred((cur) => !cur);
            setBlurButtons(false);
          }
        });
      }
    } else {
      python.toast("Not Logged In!", "You can only star themes if logged in.");
    }
  }

  async function getStarredStatus() {
    if (themeData && apiShortToken) {
      if (!apiFullToken) {
        await logInWithShortToken();
      }
      const data = (await genericGET(`/users/me/stars/${themeData.id}`, true, undefined)) as {
        starred: boolean;
      };
      if (data) {
        setStarFetchLoaded(true);
        setStarred(data.starred);
      }
    }
  }
  useEffect(() => {
    getStarredStatus();
  }, []);

  return (
    <>
      <Focusable className="CSSLoader_ThemeSettingsModal_ButtonsContainer">
        {updateStatus === "outdated" && (
          <DialogButton
            disabled={blurButtons}
            className="CSSLoader_ThemeSettingsModalHeader_DialogButton CSSLoader_ThemeSettingsModal_UpdateButton"
            onClick={async () => {
              await installTheme(themeData.id);
              // This just updates the updateStatuses arr to know that this theme now is up to date, no need to re-fetch the API to know that
              setGlobalState(
                "updateStatuses",
                updateStatuses.map((e) =>
                  e[0] === themeData.id ? [themeData.id, "installed", false] : e
                )
              );
            }}
          >
            <FaDownload className="CSSLoader_ThemeSettingsModal_IconTranslate" />
            <span className="CSSLoader_ThemeSettingsModal_UpdateText">Update</span>
          </DialogButton>
        )}
        <DialogButton
          disabled={blurButtons}
          className="CSSLoader_ThemeSettingsModalHeader_DialogButton"
          onClick={() => {
            if (isPinned) {
              python.unpinTheme(themeData.id);
            } else {
              python.pinTheme(themeData.id);
            }
          }}
        >
          {isPinned ? (
            <FaEye className="CSSLoader_ThemeSettingsModal_IconTranslate" />
          ) : (
            <FaEyeSlash className="CSSLoader_ThemeSettingsModal_IconTranslate" />
          )}
        </DialogButton>
        {starFetchLoaded && (
          <DialogButton
            disabled={blurButtons}
            className="CSSLoader_ThemeSettingsModalHeader_DialogButton"
            onClick={toggleStar}
          >
            {isStarred ? <FaStar /> : <FaRegStar />}
          </DialogButton>
        )}
        <DialogButton
          disabled={blurButtons}
          className="CSSLoader_ThemeSettingsModalHeader_DialogButton"
          onClick={() => {
            showModal(
              <DeleteConfirmationModalRoot
                leaveDeleteMode={closeModal}
                themesToBeDeleted={[themeData.name]}
              />
            );
          }}
        >
          <FaTrashAlt className="CSSLoader_ThemeSettingsModal_IconTranslate" />
        </DialogButton>
      </Focusable>
    </>
  );
}
