import {
  ButtonItem,
  Carousel,
  DialogButton,
  Focusable,
  Navigation,
  PanelSection,
  PanelSectionRow,
  showModal,
  ScrollPanelGroup,
  Panel,
} from "decky-frontend-lib";
import { useEffect, useMemo, useRef, useState, VFC } from "react";
import { ImSpinner5 } from "react-icons/im";
import { BsStar, BsStarFill } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";

import * as python from "../../python";
import { genericGET, refreshToken, toggleStar as apiToggleStar, installTheme } from "../../api";

import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { calcButtonColor } from "../../logic";
import { FullCSSThemeInfo, PartialCSSThemeInfo } from "../../apiTypes";
import { ThemeSettingsModalRoot } from "../../components/Modals/ThemeSettingsModal";

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

  // For some reason, setting the ref as the useEffect dependency didn't work...
  const backButtonRef = useRef<HTMLElement>(null);
  const [hasBeenFocused, setHasFocused] = useState<boolean>(false);
  useEffect(() => {
    if (backButtonRef?.current && !hasBeenFocused) {
      backButtonRef.current.focus();
      setHasFocused(true);
    }
  });

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
      <>
        <style>
          {`
          .flex {
            display: flex;
          }
          .flex-col {
            flex-direction: column;
          }
          .justify-center {
            justify-content: center;
          }
          .items-center {
            align-items: center;
          }
          .justify-between {
            justify-content: space-between;
          }
          .bold {
            font-weight: bold;
          }
          .text-sm {
            font-size: 0.75em;
          }
          .text-xl {
            font-size: 1.5em;
          }
          .top-offset {
            margin-top: 40px;
            height: calc(100% - 90px);
          }
          .padding-1 {
            padding: 1em;
          }
          .w-screen {
            width: 100vw;
          }
          .h-screen {
            height: 100vh;
          }
          .w-full {
            width: 100%;
          }
          .h-full {
            height: 100%;
          }
          .bg-steamBg {
            background: #0e141b;
          }
          .gap-1 {
            gap: 1em;
          }
          .gap-1\\/4 {
            gap: 0.25em;
          }
          .pb-1 {
            padding-bottom: 1em;
          }
          .flex-1 {
            flex: 1;
          }
          .image-container {
          }
          .title-container {
            padding: 1em;
          }
          .justify-end {
            justify-content: flex-end;
          }
          .overflow-y-auto {
            overflow-y: auto;
          }
          .buttons-container {
            height: 403px;
            position: sticky;
          }
          .theme-data-container {
            height: max-content;
            background: #212734;
            width: 526px;
          }
          `}
        </style>

        <Focusable className="top-offset padding-1 flex bg-steamBg">
          {/* @ts-ignore */}
          <ScrollPanelGroup focusable={false} style={{ width: "526px", display: "flex" }}>
            {/* Img + Info */}
            <Focusable className="flex flex-col gap-1 theme-data-container">
              {/* Images */}
              <Focusable className="image-container">
                <Carousel
                  fnGetId={(id) => id}
                  nHeight={fullThemeData.images.length === 1 ? 328 : 328}
                  nItemHeight={fullThemeData.images.length === 1 ? 328 : 328}
                  nItemMarginX={20}
                  initialColumn={0}
                  autoFocus={false}
                  nNumItems={fullThemeData.images.length}
                  fnGetColumnWidth={() => (fullThemeData.images.length === 1 ? 526 : 526)}
                  fnItemRenderer={(id) => {
                    return (
                      <Focusable
                        focusWithinClassName="gpfocuswithin"
                        onActivate={() => {}}
                        style={{
                          width: `${fullThemeData.images.length === 1 ? 526 : 526}px`,
                          height: `${fullThemeData.images.length === 1 ? 328 : 328}px`,
                          position: "relative",
                        }}
                      >
                        <img
                          width={fullThemeData.images.length === 1 ? 526 : 526}
                          height={fullThemeData.images.length === 1 ? 328 : 328}
                          style={{ objectFit: "contain" }}
                          src={`https://api.deckthemes.com/blobs/${fullThemeData.images[id].id}`}
                        />
                      </Focusable>
                    );
                  }}
                />
              </Focusable>
              <Focusable className="flex flex-col gap-1/4 title-container justify-between">
                {/* Info */}
                <div className="flex flex-col gap-1/4">
                  <span className="bold text-xl">{fullThemeData.displayName}</span>
                  <div className="flex gap-1/4">
                    <span>By {fullThemeData.specifiedAuthor}</span>
                    <span>{fullThemeData.version}</span>
                  </div>
                  {!apiFullToken && (
                    <div style={{ display: "flex", alignItems: "center", fontSize: "1em" }}>
                      <BsStarFill />
                      <span>{fullThemeData.starCount}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiDownload />
                    <span>{fullThemeData.download.downloadCount}</span>
                  </div>
                </div>
                {/* Description */}
                <Focusable focusWithinClassName="gpfocuswihtin" onActivate={() => {}}>
                  <PanelSection title="Description">
                    <span className={fullThemeData?.description?.length > 400 ? "text-sm" : ""}>
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
                  </PanelSection>
                </Focusable>
              </Focusable>
            </Focusable>
          </ScrollPanelGroup>
          {/* Buttons */}
          <Focusable className="flex flex-col gap-1/4 justify-end buttons-container">
            {!!apiFullToken && (
              <>
                <DialogButton onClick={toggleStar} disabled={blurStarButton}>
                  <div className="flex items-center justify-center gap-1/4">
                    {isStarred ? (
                      <BsStarFill style={{ height: "1.25em", width: "1.25em" }} />
                    ) : (
                      <BsStar style={{ height: "1.25em", width: "1.25em" }} />
                    )}{" "}
                    <span>{fullThemeData.starCount}</span>
                  </div>
                </DialogButton>
              </>
            )}
            <DialogButton
              disabled={isInstalling}
              onClick={() => {
                if (
                  installStatus === "installed" &&
                  installedThemes.find((e) => e.id === fullThemeData.id)
                ) {
                  showModal(
                    <ThemeSettingsModalRoot
                      selectedTheme={installedThemes.find((e) => e.id === fullThemeData.id)!.id}
                    />
                  );
                  return;
                }
                installTheme(fullThemeData.id);
              }}
              style={{ filter: calcButtonColor(installStatus) }}
            >
              <span className="CssLoader_ThemeBrowser_ExpandedView_InstallText">
                {calcButtonText(installStatus)}
              </span>
            </DialogButton>
            <DialogButton
              // @ts-ignore
              ref={backButtonRef}
              onClick={() => {
                setGlobalState("currentExpandedTheme", undefined);
                setFullData(undefined);
                setLoaded(false);
                Navigation.NavigateBack();
              }}
            >
              Back
            </DialogButton>
          </Focusable>
        </Focusable>
      </>
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
          background: "#0e141b",
        }}
      >
        <span>Error fetching selected theme, please go back and retry.</span>
      </div>
    </>
  );
};
