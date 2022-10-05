import { ButtonItem, PanelSectionRow, Router } from "decky-frontend-lib";
import { useEffect, useRef, VFC } from "react";

import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { browseThemeEntry } from "../customTypes";
import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { calcButtonColor } from "../logic";

export const ExpandedViewPage: VFC = () => {
  const {
    localThemeList: installedThemes,
    setLocalThemeList: setInstalledThemes,
    currentExpandedTheme,
    setCurExpandedTheme,
    isInstalling,
    setInstalling,
  } = useCssLoaderState();

  function installTheme(id: string) {
    // TODO: most of this is repeating code in other functions, I can probably refactor it to shorten it
    setInstalling(true);
    python.resolve(python.downloadTheme(id), () => {
      python.resolve(python.reset(), () => {
        python.resolve(python.getThemes(), setInstalledThemes);
        setInstalling(false);
      });
    });
  }

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

  const backButtonRef = useRef(null);
  useEffect(() => {
    // @ts-ignore
    backButtonRef?.current.focus();
  }, []);

  // if theres no theme in the detailed view
  if (currentExpandedTheme) {
    // This returns 'installed', 'outdated', or 'uninstalled'
    const installStatus = checkIfThemeInstalled(currentExpandedTheme);
    return (
      // The outermost div is to push the content down into the visible area
      <div style={{ marginTop: "40px" }}>
        <div
          style={{ display: "flex", flexDirection: "column", margin: "20px" }}
        >
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <img
              className="CssLoader_ThemeBrowser_ExpandedView_PreviewImage"
              src={currentExpandedTheme.preview_image}
              style={{
                width: "60%",
              }}
            />
            <div style={{ width: "100%", marginLeft: "16px" }}>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "1.25em" }}>
                  {currentExpandedTheme.name}
                </span>
                <span>{currentExpandedTheme.author}</span>
                <span>{currentExpandedTheme.target}</span>
                <span>{currentExpandedTheme.version}</span>
              </div>
              <div>
                <PanelSectionRow>
                  <div
                    className="CssLoader_ThemeBrowser_ExpandedView_InstallButtonColorFilter"
                    style={{
                      // This padding here overrides the default padding put on PanelSectionRow's by Valve
                      // Before this, I was using negative margin to "shrink" the element, but this is a much better solution
                      paddingTop: "0px",
                      paddingBottom: "0px",
                      // Filter is used to color the button blue for update
                      filter: calcButtonColor(installStatus),
                    }}
                  >
                    <ButtonItem
                      layout="below"
                      disabled={installStatus === "installed" || isInstalling}
                      onClick={() => {
                        installTheme(currentExpandedTheme.id);
                      }}
                    >
                      <span className="CssLoader_ThemeBrowser_ExpandedView_InstallText">
                        {calcButtonText(installStatus)}
                      </span>
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
                <PanelSectionRow>
                  <div
                    className="CssLoader_ThemeBrowser_ExpandedView_BackButtonContainer"
                    style={{
                      // This padding here overrides the default padding put on PanelSectionRow's by Valve
                      paddingTop: "0px",
                      paddingBottom: "0px",
                    }}
                  >
                    <ButtonItem
                      // They forgot to add the ref property to the buttons interface, so I'm just tsignoring the warning
                      // @ts-ignore
                      ref={backButtonRef}
                      bottomSeparator="none"
                      layout="below"
                      onClick={() => {
                        setCurExpandedTheme(undefined);
                        Router.NavigateBackOrOpenMenu();
                      }}
                    >
                      <span className="CssLoader_ThemeBrowser_ExpandedView_BackText">
                        Back
                      </span>
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 0%", flexGrow: "1" }}>
            <span>
              {currentExpandedTheme?.description || (
                <i style={{ color: "#666" }}>No description provided.</i>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <span>Error fetching selected theme, please go back and retry.</span>
    </>
  );
};
