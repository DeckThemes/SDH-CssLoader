import { PanelSectionRow, Focusable, DialogButton } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaTrash } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import * as python from "../python";

import { useCssLoaderState } from "../state";
import { Flags, Theme, UpdateStatus } from "../ThemeTypes";
import { MinimalCSSThemeInfo } from "../apiTypes";
import { bulkThemeUpdateCheck } from "../logic/bulkThemeUpdateCheck";

export const UninstallThemePage: VFC = () => {
  const { localThemeList, unpinnedThemes } = useCssLoaderState();
  const [isUninstalling, setUninstalling] = useState(false);

  const [updateStatuses, setUpdateStatuses] = useState<UpdateStatus[]>([]);

  function handleUninstall(listEntry: Theme) {
    setUninstalling(true);
    python.resolve(python.deleteTheme(listEntry.name), () => {
      if (unpinnedThemes.includes(listEntry.id)) {
        // This isn't really pinning it, it's just removing its name from the unpinned list.
        python.pinTheme(listEntry.id);
      }
      python.reloadBackend().then(() => {
        setUninstalling(false);
      });
    });
  }

  function updateTheme(remoteEntry: MinimalCSSThemeInfo | false) {
    if (remoteEntry && remoteEntry?.id) {
      const id = remoteEntry.id;
      setUninstalling(true);
      python.resolve(python.downloadThemeFromUrl(id), () => {
        python.reloadBackend();
        setUninstalling(false);
      });
    }
  }

  useEffect(() => {
    bulkThemeUpdateCheck(localThemeList).then((value) => {
      setUpdateStatuses(value);
    });
  }, [localThemeList]);

  if (localThemeList.filter((e) => !e.bundled).length === 0) {
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
            let [updateStatus, remoteEntry]: [string, false | MinimalCSSThemeInfo] = [
              "installed",
              false,
            ];
            const themeArrPlace = updateStatuses.find((f) => f[0] === e.id);
            if (themeArrPlace) {
              updateStatus = themeArrPlace[1];
              remoteEntry = themeArrPlace[2];
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
                  <span>{e.name}</span>
                  {/* Only show the version for themes that aren't presets */}
                  <span
                    style={{
                      color: "#dcdedf55",
                      marginLeft: "8px",
                    }}
                  >
                    {e.flags.includes(Flags.isPreset) ? "Profile" : e.version}
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
                    {/* This shows when a theme is local, but not a preset */}
                    {updateStatus === "local" && !e.flags.includes(Flags.isPreset) && (
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
