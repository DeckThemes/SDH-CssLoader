import { PanelSectionRow, Focusable, DialogButton } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaTrash } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import * as python from "../python";

import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { PartialCSSThemeInfo } from "../apiTypes";
import { checkForUpdateById } from "../api";

export type LocalThemeStatus = "installed" | "outdated" | "local";

export const UninstallThemePage: VFC = () => {
  const { localThemeList, browseThemeList } = useCssLoaderState();

  const [isUninstalling, setUninstalling] = useState(false);

  const [updateStatuses, setUpdateStatuses] = useState<
    [LocalThemeStatus, false | PartialCSSThemeInfo][]
  >([]);

  function handleUninstall(listEntry: Theme) {
    setUninstalling(true);
    python.resolve(python.deleteTheme(listEntry.data.name), () => {
      python.reloadBackend().then(() => {
        setUninstalling(false);
      });
    });
  }

  function updateTheme(remoteEntry: PartialCSSThemeInfo | false) {
    if (remoteEntry && remoteEntry?.id) {
      const id = remoteEntry.id;
      setUninstalling(true);
      python.resolve(python.downloadThemeFromUrl(id), () => {
        python.reloadBackend();
        setUninstalling(false);
      });
    }
  }

  // This gets the update status of all installed themes by querying them all.
  useEffect(() => {
    if (localThemeList.length > 0) {
      const promiseArr: Promise<PartialCSSThemeInfo | false>[] = [];
      localThemeList.forEach((e) => {
        const entryInBrowseList: PartialCSSThemeInfo | undefined = browseThemeList.items.find(
          (f) => e.id === f.id || e.id === f.name
        );
        if (entryInBrowseList) {
          const promise: Promise<PartialCSSThemeInfo> = new Promise((resolve) => {
            resolve(entryInBrowseList);
          });
          promiseArr.push(promise);
          return;
        }
        // This function returns the data if it exists, or false if it doesn't
        const promise = checkForUpdateById(e.id);
        promiseArr.push(promise);
      });
      Promise.all(promiseArr).then((themeArr) => {
        let updateStatusArr: [LocalThemeStatus, false | PartialCSSThemeInfo][] = [];
        themeArr.forEach((data, i) => {
          if (data) {
            const localEntry = localThemeList[i];
            if (data?.version) {
              if (data.version === localEntry.data.version) {
                updateStatusArr.push(["installed", data]);
                return;
              }
              updateStatusArr.push(["outdated", data]);
              return;
            }
          }
          updateStatusArr.push(["local", false]);
          return;
        });
        setUpdateStatuses(updateStatusArr);
      });
    }
  }, [localThemeList]);

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
          {localThemeList.map((e: Theme, i) => {
            let [updateStatus, remoteEntry]: [string, false | PartialCSSThemeInfo] = [
              "installed",
              false,
            ];
            // It now needs to wait until the promises have resolves to get these values
            if (updateStatuses[i]) {
              [updateStatus, remoteEntry] = updateStatuses[i];
            }
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
                          filter:
                            "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)",
                        }}
                        onClick={() => updateTheme(remoteEntry)}
                        disabled={isUninstalling}
                      >
                        <AiOutlineDownload />
                      </DialogButton>
                    )}
                    {updateStatus === "local" && (
                      <span
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "50%",
                          transform: "translate(0, -50%)",
                        }}
                      >
                        <i>Local Theme</i>
                      </span>
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
