import { ButtonItem, Navigation, PanelSectionRow, showModal } from "decky-frontend-lib";
import { useEffect, useMemo, useRef, useState, VFC } from "react";
import { ImSpinner5 } from "react-icons/im";
import { BsStar, BsStarFill } from "react-icons/bs";
import { FiArrowLeft, FiArrowRight, FiDownload } from "react-icons/fi";

import * as python from "../python";
import { genericGET, refreshToken, toggleStar as apiToggleStar } from "../api";

import { useCssLoaderState } from "../state";
import { Theme } from "../ThemeTypes";
import { calcButtonColor } from "../logic";
import { FullCSSThemeInfo, PartialCSSThemeInfo } from "../apiTypes";
import { ThemeSettingsModalRoot } from "../components";

export const ExpandedViewPage: VFC = () => {
  const {
    localThemeList: installedThemes,
    currentExpandedTheme,
    isInstalling,
    apiUrl,
    apiFullToken,
    setGlobalState,
  } = useCssLoaderState();

  const [fullThemeData, setFullData] = useState<FullCSSThemeInfo>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isStarred, setStarred] = useState<boolean>(false);
  const [blurStarButton, setBlurStar] = useState<boolean>(false);
  const [selectedImage, setSelected] = useState<number>(0);

  const currentImg = useMemo(() => {
    if (
      fullThemeData?.images[selectedImage]?.id &&
      fullThemeData.images[selectedImage].id !== "MISSING"
    ) {
      return `url(https://api.deckthemes.com/blobs/${fullThemeData?.images[selectedImage].id})`;
    } else {
      return `url(https://share.deckthemes.com/${fullThemeData?.type.toLowerCase()}placeholder.png)`;
    }
  }, [selectedImage, fullThemeData]);

  function incrementImg() {
    if (selectedImage < fullThemeData!.images.length - 1) {
      setSelected(selectedImage + 1);
      return;
    }
    setSelected(0);
  }
  function decrementImg() {
    if (selectedImage === 0) {
      setSelected(fullThemeData!.images.length - 1);
      return;
    }
    setSelected(selectedImage - 1);
  }
  async function getStarredStatus() {
    if (fullThemeData) {
      genericGET(`/users/me/stars/${fullThemeData.id}`, true).then((data) => {
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
        apiToggleStar(fullThemeData.id, isStarred, newToken, apiUrl).then((bool) => {
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
    } else {
      python.toast("Not Logged In!", "You can only star themes if logged in.");
    }
  }

  function installTheme() {
    if (fullThemeData?.id) {
      setGlobalState("isInstalling", true);
      python.resolve(python.downloadThemeFromUrl(fullThemeData.id), () => {
        python.reloadBackend().then(() => {
          setGlobalState("isInstalling", false);
        });
      });
    } else {
      python.toast("Error Downloading!", "Can't find theme ID");
    }
  }

  function checkIfThemeInstalled(themeObj: PartialCSSThemeInfo) {
    const filteredArr: Theme[] = installedThemes.filter(
      (e: Theme) => e.name === themeObj.name && e.author === themeObj.specifiedAuthor
    );
    if (filteredArr.length > 0) {
      if (filteredArr[0].version === themeObj.version) {
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
        buttonText = "Configure";
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
      genericGET(`/themes/${currentExpandedTheme.id}`).then((data) => {
        setFullData(data);
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
            <div
              style={{
                backgroundImage: `${currentImg}`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "60%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {fullThemeData.images.length > 1 && (
                <>
                  <FiArrowLeft size={36} onClick={decrementImg} style={{ padding: "4px" }} />
                  <FiArrowRight size={36} onClick={incrementImg} style={{ padding: "4px" }} />
                </>
              )}
            </div>
            <div
              style={{
                width: "40%",
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
                      // disabled={installStatus === "installed" || isInstalling}
                      onClick={() => {
                        if (
                          installStatus === "installed" &&
                          installedThemes.find((e) => e.id === fullThemeData.id)
                        ) {
                          showModal(
                            // @ts-ignore
                            <ThemeSettingsModalRoot
                              selectedTheme={
                                installedThemes.find((e) => e.id === fullThemeData.id)!.id
                              }
                            />
                          );
                          return;
                        }
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
