import { PanelSectionRow, Focusable, DialogButton } from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaTrash } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import * as python from "../python";

import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { PartialCSSThemeInfo } from "../apiTypes";

export const UninstallThemePage: VFC = () => {
  const { localThemeList, setLocalThemeList, browseThemeList, apiUrl } = useCssLoaderState();

  const [isUninstalling, setUninstalling] = useState(false);

  function handleUninstall(listEntry: Theme) {
    setUninstalling(true);
    python.resolve(python.deleteTheme(listEntry.data.name), () => {
      python.resolve(python.reset(), () => {
        python.resolve(python.getThemes(), setLocalThemeList);
        setUninstalling(false);
      });
    });
  }

  function updateTheme(remoteEntry: PartialCSSThemeInfo) {
    if (remoteEntry.id) {
      const id = remoteEntry.id;
      setUninstalling(true);
      python.resolve(python.downloadThemeFromUrl(id, apiUrl), () => {
        python.resolve(python.reset(), () => {
          python.resolve(python.getThemes(), setLocalThemeList);
          setUninstalling(false);
        });
      });
    }
  }

  // This is a modified version of the checkIfThemeInstalled in the browser page, however it compares local themes to the remote ones instead of remote to local
  // It also returns the remote entry, so that it's id can be referenced for downloads
  function checkForUpdate(themeObj: Theme): [string, any] {
    const filteredArr: PartialCSSThemeInfo[] = browseThemeList.items.filter(
      (e: PartialCSSThemeInfo) =>
        e.name === themeObj.data.name && e.specifiedAuthor === themeObj.data.author
    );
    if (filteredArr.length > 0) {
      if (filteredArr[0].version === themeObj.data.version) {
        return ["installed", filteredArr[0]];
      } else {
        return ["outdated", filteredArr[0]];
      }
    } else {
      return ["uninstalled", false];
    }
  }

  if (localThemeList.filter((e) => !e.data.bundled).length === 0) {
    return (
      <PanelSectionRow>
        <span>No custom themes installed, find some in the 'Browse Themes' tab.</span>
      </PanelSectionRow>
    );
  }

  return (
    <>
      <div>
        <div>
          {localThemeList
            .filter((e) => !e.data.bundled)
            .map((e: Theme) => {
              const [updateStatus, remoteEntry] = checkForUpdate(e);
              return (
                <PanelSectionRow>
                  <div
                    style={{
                      display: "flex",
                      // TODO: I think that this 96% can be deleted, have to check
                      width: "96%",
                    }}
                  >
                    <span>{e.data.name}</span>
                    <span
                      style={{
                        color: "#dcdedf55",
                        marginLeft: "8px",
                      }}
                    >
                      {e.data.version}
                    </span>
                    <Focusable
                      style={{
                        display: "flex",
                        marginLeft: "auto",
                        minWidth: "60%",
                        maxWidth: "60%",
                      }}
                    >
                      {/* Update Button */}
                      {updateStatus === "outdated" && (
                        <>
                          <DialogButton
                            style={{
                              marginRight: "8px",
                              minWidth: "calc(50% - 8px)",
                              maxWidth: "calc(50% - 8px)",
                              filter:
                                "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)",
                            }}
                            onClick={() => updateTheme(remoteEntry)}
                            disabled={isUninstalling}
                          >
                            <AiOutlineDownload />
                          </DialogButton>{" "}
                        </>
                      )}
                      <DialogButton
                        style={{
                          minWidth: "calc(50% - 8px)",
                          maxWidth: "calc(50% - 8px)",
                          marginLeft: "auto",
                        }}
                        onClick={() => handleUninstall(e)}
                        disabled={isUninstalling}
                      >
                        <FaTrash />
                      </DialogButton>
                    </Focusable>
                  </div>
                </PanelSectionRow>
              );
            })}
        </div>
      </div>
    </>
  );
};
