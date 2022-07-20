import { ButtonItem, PanelSectionRow, Focusable } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";

import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { browseThemeEntry } from "../customTypes";
import { useCssLoaderState } from "../state/CssLoaderState";
import { Theme } from "../theme";

export const ThemeBrowserPage: VFC = () => {
  const {
    browseThemeList: themeArr,
    setBrowseThemeList: setThemeArr,
    localThemeList: installedThemes,
    setLocalThemeList: setInstalledThemes,
  } = useCssLoaderState();

  // This is used to disable buttons during a theme install
  const [isInstalling, setInstalling] = useState(false);

  function reloadThemes() {
    // Reloads the theme database
    python.resolve(python.reloadThemeDbData(), () => {
      python.resolve(python.getThemeDbData(), setThemeArr);
    });
    // Reloads the local themes
    python.resolve(python.reset(), () => {
      python.resolve(python.getThemes(), setInstalledThemes);
    });
  }

  function getThemeDb() {
    python.resolve(python.getThemeDbData(), setThemeArr);
  }
  function getInstalledThemes() {
    python.resolve(python.getThemes(), setInstalledThemes);
  }

  function installTheme(id: string) {
    // TODO: most of this is repeating code in other functions, I can probably refactor it to shorten it
    setInstalling(true);
    python.resolve(python.downloadTheme(id), () => {
      python.resolve(python.reset(), () => {
        python.resolve(python.getThemes(), setInstalledThemes);
      });
      setInstalling(false);
    });
  }
  console.log(installedThemes);

  function checkIfThemeInstalled(themeObj: browseThemeEntry) {
    const filteredArr: Theme[] = installedThemes.filter(
      (e: Theme) =>
        e.data.name === themeObj.name && e.data.author === themeObj.author
    );
    if (filteredArr.length > 0) {
      if (filteredArr[0].data.version === themeObj.version) {
        return "installed";
      } else {
        return "outdated";
      }
    } else {
      return "uninstalled";
    }
  }
  // These are just switch statements I use to determine text/css for the buttons
  // I put them up here just because I find it clearer to read when they aren't inline
  function calcButtonColor(installStatus: string) {
    let filterCSS = "";
    switch (installStatus) {
      case "outdated":
        filterCSS =
          "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)";
        break;
      default:
        filterCSS = "";
        break;
    }
    return filterCSS;
  }
  function calcButtonText(installStatus: string) {
    let buttonText = "";
    switch (installStatus) {
      case "installed":
        buttonText = "Installed";
        break;
      case "outdated":
        buttonText = "Update";
        break;
      default:
        buttonText = "Install";
        break;
    }
    return buttonText;
  }

  // Runs upon opening the page
  useEffect(() => {
    getThemeDb();
    getInstalledThemes();
  }, []);

  return (
    <>
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            reloadThemes();
          }}>
          Reload Themes
        </ButtonItem>
      </PanelSectionRow>
      {/* I wrap everything in a Focusable, because that ensures that the dpad/stick navigation works correctly */}
      <Focusable style={{ display: "flex", flexWrap: "wrap" }}>
        {themeArr.map((e: browseThemeEntry) => {
          const installStatus = checkIfThemeInstalled(e);
          return (
            // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
            <div
              style={{
                backgroundImage: 'url("' + e.preview_image + '")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "260px",
                margin: "10px",
                borderRadius: "5px",
              }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "RGBA(0,0,0,0.8)",
                  backdropFilter: "blur(4px)",
                  width: "100%",
                  height: "100%",
                  borderRadius: "5px",
                }}>
                <span
                  style={{
                    marginTop: "5px",
                    fontSize: "1.5em",
                    fontWeight: "bold",
                  }}>
                  {e.name}
                </span>
                <div
                  style={{
                    width: "240px",
                    backgroundImage: 'url("' + e.preview_image + '")',
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}></div>
                <div
                  style={{
                    width: "240px",
                    textAlign: "center",
                    display: "flex",
                  }}>
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: "1em",
                      textShadow: "rgb(48, 48, 48) 0px 0 10px",
                    }}>
                    {e.author}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "1em",
                      textShadow: "rgb(48, 48, 48) 0px 0 10px",
                    }}>
                    {e.version}
                  </span>
                </div>
                <div
                  style={{
                    width: "245px",
                  }}>
                  <PanelSectionRow>
                    <div
                      style={{
                        // Filter is used to color the button blue for update
                        filter: calcButtonColor(installStatus),
                      }}>
                      <ButtonItem
                        layout='below'
                        disabled={installStatus === "installed" || isInstalling}
                        onClick={() => {
                          installTheme(e.id);
                        }}>
                        <span>{calcButtonText(installStatus)}</span>
                      </ButtonItem>
                    </div>
                  </PanelSectionRow>
                </div>
              </div>
            </div>
          );
        })}
      </Focusable>
    </>
  );
};
