import {
  ButtonItem,
  Carousel,
  DialogButton,
  Focusable,
  Navigation,
  PanelSectionRow,
  showModal,
} from "decky-frontend-lib";
import { useEffect, useMemo, useRef, useState, VFC } from "react";
import { ImSpinner5 } from "react-icons/im";
import { BsStar, BsStarFill } from "react-icons/bs";
import { FiArrowLeft, FiArrowRight, FiDownload } from "react-icons/fi";

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
          .align-center {
            align-items: center;
          }
          .justify-between {
            justify-content: space-between;
          }
          .bold {
            font-weight: bold;
          }
          .text-lg {
            font-size: 1.25em;
          }
          .text-xl {
            font-size: 2em;
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
          .title-container {
            flex: 0.8;
          }
          .gap-1\/4 {
            gap: 0.25em;
          }
          .pb-1 {
            padding-bottom: 1em;
          }
          .flex-1 {
            flex: 1;
          }
          `}
        </style>
        <div className="w-screen h-screen bg-steamBg">
          <div className="top-offset padding-1 flex flex-col">
            {/* Title container */}
            <div className="flex flex-col">
              <span className="bold text-xl">{fullThemeData.displayName}</span>
              <span className="text-lg">{fullThemeData.specifiedAuthor}</span>
              <span>{fullThemeData.description}</span>
            </div>
            {/* Img + Details */}
            <div className="flex w-full justify-between">
              {/* Imgs */}
              <Focusable className="flex-1">
                <Carousel
                  fnGetId={(id) => id}
                  nHeight={266}
                  nItemHeight={266}
                  nItemMarginX={20}
                  initialColumn={0}
                  autoFocus
                  nNumItems={fullThemeData.images.length}
                  fnGetColumnWidth={() => 426}
                  fnItemRenderer={(id) => {
                    return (
                      <Focusable
                        focusWithinClassName="gpfocuswithin"
                        onActivate={() => {
                          console.log("test");
                        }}
                        style={{
                          width: "426px",
                          height: "266px",
                          background: "#f00a",
                          position: "relative",
                        }}
                      >
                        <img
                          width={426}
                          height={266}
                          style={{ objectFit: "contain" }}
                          src={`https://api.deckthemes.com/blobs/${fullThemeData.images[id].id}`}
                        />
                      </Focusable>
                    );
                  }}
                />
              </Focusable>
              {/* Details */}
              <div className="flex flex-col padding-1">
                <div className="flex flex-col">
                  <span className="bold">Category</span>
                  <span>{fullThemeData.target}</span>
                </div>
                <div className="flex flex-col">
                  <span className="bold">Version</span>
                  <span>{fullThemeData.version}</span>
                </div>
                <div className="flex flex-col">
                  <span className="bold">Published</span>
                  <span>{new Date(fullThemeData.submitted).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="bold">Updates</span>
                  <span>{new Date(fullThemeData.updated).toLocaleDateString()}</span>
                </div>
                {!apiFullToken && (
                  <div className="flex flex-col">
                    <span className="bold">Stars</span>
                    <span>
                      {fullThemeData.starCount} Star{fullThemeData.starCount === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col gap-1/4" style={{ width: "300px" }}>
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
            </div>
          </div>
        </div>
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
