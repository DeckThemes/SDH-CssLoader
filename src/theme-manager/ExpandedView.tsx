import { ButtonItem, Navigation, PanelSectionRow } from "decky-frontend-lib";
import { useEffect, useRef, useState, VFC } from "react";
import { ImSpinner5 } from "react-icons/im";
import { BsStar, BsStarFill } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";

import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { calcButtonColor } from "../logic";
import { FullCSSThemeInfo, PartialCSSThemeInfo } from "../apiTypes";

export const ExpandedViewPage: VFC = () => {
  const {
    localThemeList: installedThemes,
    setLocalThemeList: setInstalledThemes,
    currentExpandedTheme,
    isInstalling,
    apiUrl,
    apiFullToken,
    apiTokenExpireDate,
    setGlobalState,
  } = useCssLoaderState();

  const [fullThemeData, setFullData] = useState<FullCSSThemeInfo>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isStarred, setStarred] = useState<boolean>(false);
  const [blurStarButton, setBlurStar] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(
    `https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Steam_Deck_logo_%28blue_background%29.svg/2048px-Steam_Deck_logo_%28blue_background%29.svg.png`
  );

  async function refreshToken() {
    if (!apiFullToken) {
      return undefined;
    }
    if (apiTokenExpireDate === undefined) {
      return apiFullToken;
    }
    if (new Date().valueOf() < apiTokenExpireDate) {
      return apiFullToken;
    }
    return python.refreshToken(`${apiUrl}/auth/refresh_token`, apiFullToken).then((token) => {
      setGlobalState("apiFullToken", token);
      setGlobalState("apiTokenExpireDate", new Date().valueOf() + 1000 * 10 * 60);
      return token;
    });
  }

  async function getStarredStatus() {
    const newToken = await refreshToken();
    if (newToken && fullThemeData) {
      python.genericGET(`${apiUrl}/users/me/stars/${fullThemeData.id}`, newToken).then((data) => {
        if (data.starred) {
          setStarred(data.starred);
        }
        if (data.starred && fullThemeData?.starCount === 0) {
          setFullData({
            ...fullThemeData,
            starCount: 1,
          });
        }
      });
    }
  }

  async function toggleStar() {
    if (apiFullToken) {
      setBlurStar(true);
      const newToken = await refreshToken();
      if (fullThemeData && newToken) {
        python.toggleStar(fullThemeData.id, isStarred, newToken, apiUrl).then((bool) => {
          if (bool) {
            setFullData({
              ...fullThemeData,
              starCount: isStarred
                ? fullThemeData.starCount === 0
                  ? // This stops it from going below 0
                    fullThemeData.starCount
                  : fullThemeData.starCount - 1
                : fullThemeData.starCount + 1,
            });
            setStarred((cur) => !cur);
            setBlurStar(false);
          }
        });
      }
    }
  }

  function installTheme() {
    setGlobalState("isInstalling", true);
    python.resolve(python.downloadThemeFromUrl(fullThemeData?.id || "ERROR", apiUrl), () => {
      python.resolve(python.reset(), () => {
        python.resolve(python.getThemes(), setInstalledThemes);
        setGlobalState("isInstalling", false);
      });
    });
  }

  function checkIfThemeInstalled(themeObj: PartialCSSThemeInfo) {
    const filteredArr: Theme[] = installedThemes.filter(
      (e: Theme) => e.data.name === themeObj.name && e.data.author === themeObj.specifiedAuthor
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

  const backButtonRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (backButtonRef?.current) {
      backButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (currentExpandedTheme?.id) {
      setLoaded(false);
      python.genericGET(`${apiUrl}/themes/${currentExpandedTheme.id}`).then((data) => {
        setFullData(data);
        if (data?.images[0]?.id && data.images[0].id !== "MISSING") {
          setImageUrl(`${apiUrl}/blobs/${data?.images[0].id}`);
        } else {
          setImageUrl(
            `https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Steam_Deck_logo_%28blue_background%29.svg/2048px-Steam_Deck_logo_%28blue_background%29.svg.png`
          );
        }
        setLoaded(true);
      });
    }
  }, [currentExpandedTheme]);

  useEffect(() => {
    if (apiFullToken && fullThemeData) {
      getStarredStatus();
    }
  }, [apiFullToken, fullThemeData]);

  if (!loaded) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            .spinny {
              animation: spin 1s linear infinite;
            }
          `}
        </style>
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "1em",
            alignItems: "center",
            justifyContent: "center",
            flex: "1",
          }}
        >
          <ImSpinner5 className="spinny" size={48} />
          <span style={{ fontWeight: "bold", fontSize: "2.5em" }}>Loading</span>
        </div>
      </>
    );
  }

  // if theres no theme in the detailed view
  if (fullThemeData) {
    // This returns 'installed', 'outdated', or 'uninstalled'
    const installStatus = checkIfThemeInstalled(fullThemeData);
    return (
      // The outermost div is to push the content down into the visible area
      <div
        style={{
          marginTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: "8px",
            }}
          >
            <img
              className="CssLoader_ThemeBrowser_ExpandedView_PreviewImage"
              src={imageUrl}
              style={{
                maxHeight: "400px",
                width: "60%",
              }}
            />
            <div
              style={{
                width: "100%",
                marginLeft: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.25em",
                  }}
                >
                  {fullThemeData.name}
                </span>
                <span>{fullThemeData.specifiedAuthor}</span>
                <span>{fullThemeData.target}</span>
                <span>{fullThemeData.version}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {!apiFullToken && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", fontSize: "1em" }}>
                        <BsStarFill />
                        <span>{fullThemeData.starCount}</span>
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", alignItems: "center", fontSize: "1em" }}>
                    <FiDownload />
                    <span>{fullThemeData.download.downloadCount}</span>
                  </div>
                </div>
              </div>
              <div>
                {!!apiFullToken && (
                  <>
                    <PanelSectionRow>
                      <div
                        className="CssLoader_ThemeBrowser_ExpandedView_StarButton"
                        style={{
                          // This padding here overrides the default padding put on PanelSectionRow's by Valve
                          // Before this, I was using negative margin to "shrink" the element, but this is a much better solution
                          paddingTop: "0px",
                          paddingBottom: "0px",
                        }}
                      >
                        <ButtonItem layout="below" onClick={toggleStar} disabled={blurStarButton}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25em",
                            }}
                          >
                            {isStarred ? (
                              <BsStarFill style={{ height: "1.25em", width: "1.25em" }} />
                            ) : (
                              <BsStar style={{ height: "1.25em", width: "1.25em" }} />
                            )}{" "}
                            <span>{fullThemeData.starCount}</span>
                          </div>
                        </ButtonItem>
                      </div>
                    </PanelSectionRow>
                  </>
                )}
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
                        installTheme();
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
                        setGlobalState("currentExpandedTheme", undefined);
                        setFullData(undefined);
                        setLoaded(false);
                        // Wow amazing navigation interface I wonder who coded it
                        Navigation.NavigateBack();
                      }}
                    >
                      <span className="CssLoader_ThemeBrowser_ExpandedView_BackText">Back</span>
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
              </div>
            </div>
          </div>
          <div
            style={{
              flex: "1 1 0%",
              flexGrow: "1",
            }}
          >
            <span>
              {fullThemeData?.description || (
                <i
                  style={{
                    color: "#666",
                  }}
                >
                  No description provided.
                </i>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          gap: "1em",
          alignItems: "center",
          justifyContent: "center",
          flex: "1",
        }}
      >
        <span>Error fetching selected theme, please go back and retry.</span>
      </div>
    </>
  );
};
