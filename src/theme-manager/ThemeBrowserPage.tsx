import {
  ButtonItem,
  PanelSectionRow,
  Focusable,
  TextField,
  DropdownOption,
  DropdownItem,
  SingleDropdownOption,
  Router,
} from "decky-frontend-lib";
import { useEffect, useMemo, useState, VFC } from "react";

import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { browseThemeEntry } from "../customTypes";
import { useCssLoaderState } from "../state";
import { Theme } from "../theme";

export const ThemeBrowserPage: VFC = () => {
  const {
    browseThemeList: themeArr,
    setBrowseThemeList: setThemeArr,
    localThemeList: installedThemes,
    setLocalThemeList: setInstalledThemes,
    isInstalling,
    // setInstalling,
    // currentExpandedTheme,
    setCurExpandedTheme
  } = useCssLoaderState();

  const [searchFieldValue, setSearchValue] = useState<string>("");

  // This is used to disable buttons during a theme install
  // const [isInstalling, setInstalling] = useState<boolean>(false);

  const [backendVersion, setBackendVer] = useState<number>(2);
  function reloadBackendVer() {
    python.resolve(python.getBackendVersion(), setBackendVer);
  }

  const searchFilter = (e: browseThemeEntry) => {
    // This means only compatible themes will show up, newer ones won't
    if (e.manifest_version > backendVersion) {
      return false;
    }
    // This filter just implements the search stuff
    if (searchFieldValue.length > 0) {
      // Convert the theme and search to lowercase so that it's not case-sensitive
      if (
        // This checks for the theme name
        !e.name.toLowerCase().includes(searchFieldValue.toLowerCase()) &&
        // This checks for the author name
        !e.author.toLowerCase().includes(searchFieldValue.toLowerCase())
      ) {
        // return false just means it won't show in the list
        return false;
      }
    }
    return true;
  };

  const [selectedSort, setSort] = useState<number>(3);
  const sortOptions = useMemo(
    (): DropdownOption[] => [
      { data: 1, label: "Alphabetical (A to Z)" },
      { data: 2, label: "Alphabetical (Z to A)" },
      { data: 3, label: "Last Updated (Newest)" },
      { data: 4, label: "Last Updated (Oldest)" },
    ],
    []
  );

  const [selectedTarget, setTarget] = useState<SingleDropdownOption>({
    data: 1,
    label: "All",
  });
  const targetOptions = useMemo((): DropdownOption[] => {
    const uniqueTargets = new Set(
      themeArr.filter(searchFilter).map((e) => e.target)
    );
    return [
      { data: 1, label: "All" },
      { data: 2, label: "Installed" },
      ...[...uniqueTargets].map((e, i) => ({ data: i + 3, label: e })),
    ];
  }, [themeArr, searchFilter]);

  function reloadThemes() {
    reloadBackendVer();
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

  // Installing is now handled on the ExpandedView 

  // function installTheme(id: string) {
  //   // TODO: most of this is repeating code in other functions, I can probably refactor it to shorten it
  //   setInstalling(true);
  //   python.resolve(python.downloadTheme(id), () => {
  //     python.resolve(python.reset(), () => {
  //       python.resolve(python.getThemes(), setInstalledThemes);
  //       setInstalling(false);
  //     });
  //   });
  // }

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
  // function calcButtonText(installStatus: string) {
  //   let buttonText = "";
  //   switch (installStatus) {
  //     case "installed":
  //       buttonText = "Installed";
  //       break;
  //     case "outdated":
  //       buttonText = "Update";
  //       break;
  //     default:
  //       buttonText = "Install";
  //       break;
  //   }
  //   return buttonText;
  // }

  // Runs upon opening the page
  useEffect(() => {
    reloadBackendVer();
    getThemeDb();
    getInstalledThemes();
  }, []);

  return (
    <>
      <PanelSectionRow>
        <DropdownItem
          label='Sort'
          rgOptions={sortOptions}
          strDefaultLabel='Last Updated (Newest)'
          selectedOption={selectedSort}
          onChange={(e) => setSort(e.data)}
        />
        <DropdownItem
          label='Filter'
          rgOptions={targetOptions}
          strDefaultLabel='All'
          selectedOption={selectedTarget.data}
          onChange={(e) => setTarget(e)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <TextField
          label='Search'
          value={searchFieldValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </PanelSectionRow>
      {/* I wrap everything in a Focusable, because that ensures that the dpad/stick navigation works correctly */}
      <Focusable style={{ display: "flex", flexWrap: "wrap" }}>
        {themeArr
          // searchFilter also includes backend version check
          .filter(searchFilter)
          .filter((e: browseThemeEntry) => {
            if (selectedTarget.label === "All") {
              return true;
            } else if (selectedTarget.label === "Installed") {
              const strValue = checkIfThemeInstalled(e);
              return strValue === "installed" || strValue === "outdated";
            } else {
              return e.target === selectedTarget.label;
            }
          })
          .sort((a, b) => {
            // This handles the sort option the user has chosen
            switch (selectedSort) {
              case 2:
                // Z-A
                // localeCompare just sorts alphabetically
                return b.name.localeCompare(a.name);
              case 3:
                // New-Old
                return (
                  new Date(b.last_changed).valueOf() -
                  new Date(a.last_changed).valueOf()
                );
              case 4:
                // Old-New
                return (
                  new Date(a.last_changed).valueOf() -
                  new Date(b.last_changed).valueOf()
                );
              default:
                // This is just A-Z
                return a.name.localeCompare(b.name);
            }
          })
          .map((e: browseThemeEntry) => {
            const installStatus = checkIfThemeInstalled(e);
            return (
              // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
              <>
                <div
                  className='CssLoader_ThemeBrowser_SingleItem_BgImage'
                  style={{
                    backgroundImage: 'url("' + e.preview_image + '")',
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    width: "260px",
                    borderRadius: "5px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    marginBottom: "20px",
                  }}>
                  <div
                    className='CssLoader_ThemeBrowser_SingleItem_BgOverlay'
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "RGBA(0,0,0,0.8)",
                      backdropFilter: "blur(5px)",
                      width: "100%",
                      height: "100%",
                      borderRadius: "3px",
                    }}>
                    <span
                      className='CssLoader_ThemeBrowser_SingleItem_ThemeName'
                      style={{
                        textAlign: "center",
                        marginTop: "5px",
                        fontSize: "1.25em",
                        fontWeight: "bold",
                        // This stuff here truncates it if it's too long
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "90%",
                      }}>
                      {e.name}
                    </span>
                    {selectedTarget.label === "All" && (
                      <span
                        className='CssLoader_ThemeBrowser_SingleItem_ThemeTarget'
                        style={{
                          marginTop: "-6px",
                          fontSize: "1em",
                          textShadow: "rgb(48, 48, 48) 0px 0 10px",
                        }}>
                        {e.target}
                      </span>
                    )}
                    <div
                      className='CssLoader_ThemeBrowser_SingleItem_PreviewImage'
                      style={{
                        width: "240px",
                        backgroundImage: 'url("' + e.preview_image + '")',
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        height: "150px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    />
                    <div
                      className='CssLoader_ThemeBrowser_SingleItem_AuthorVersionContainer'
                      style={{
                        width: "240px",
                        textAlign: "center",
                        display: "flex",
                      }}>
                      <span
                        className='CssLoader_ThemeBrowser_SingleItem_AuthorText'
                        style={{
                          marginRight: "auto",
                          fontSize: "1em",
                          textShadow: "rgb(48, 48, 48) 0px 0 10px",
                        }}>
                        {e.author}
                      </span>
                      <span
                        className='CssLoader_ThemeBrowser_SingleItem_VersionText'
                        style={{
                          marginLeft: "auto",
                          fontSize: "1em",
                          textShadow: "rgb(48, 48, 48) 0px 0 10px",
                        }}>
                        {e.version}
                      </span>
                    </div>
                    <div
                      className='CssLoader_ThemeBrowser_SingleItem_InstallButtonContainer'
                      style={{
                        marginTop: "auto",
                        width: "245px",
                      }}>
                      <PanelSectionRow>
                        <div
                          className='CssLoader_ThemeBrowser_SingleItem_OpenExpandedViewContainer'
                          style={{
                            // This padding here overrides the default padding put on PanelSectionRow's by Valve
                            // Before this, I was using negative margin to "shrink" the element, but this is a much better solution
                            paddingTop: "0px",
                            paddingBottom: "0px",

                            filter: calcButtonColor(installStatus)
                          }}>
                          <ButtonItem
                            bottomSeparator={false}
                            layout='below'
                            disabled={isInstalling}
                            onClick={() => {
                              setCurExpandedTheme(e);
                              Router.Navigate("/theme-manager-expanded-view");
                            }}>
                            <span className='CssLoader_ThemeBrowser_SingleItem_OpenExpandedViewText'>
                              {installStatus === "outdated"
                                ? "Update Available"
                                : "See More"}
                            </span>
                          </ButtonItem>
                        </div>
                      </PanelSectionRow>
                    </div>
                  </div>
                </div>
              </>
            );
          })}
      </Focusable>
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            reloadThemes();
          }}>
          Reload Themes
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
};
