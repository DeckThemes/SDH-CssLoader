import {
  DialogButton,
  Focusable,
  Navigation,
  showModal,
  ScrollPanelGroup,
} from "decky-frontend-lib";
import { useEffect, useRef, useState, VFC } from "react";
import { ImCog, ImSpinner5 } from "react-icons/im";
import { BsStar, BsStarFill } from "react-icons/bs";

import * as python from "../../python";
import { genericGET, refreshToken, toggleStar as apiToggleStar, installTheme } from "../../api";

import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { FullCSSThemeInfo, PartialCSSThemeInfo } from "../../apiTypes";
import { ThemeSettingsModalRoot } from "../../components/Modals/ThemeSettingsModal";
import { AuthorViewModalRoot } from "../../components/Modals/AuthorViewModal";
import { ExpandedViewStyles } from "../../components/Styles";
import { shortenNumber } from "../../logic/numbers";
import { FaRegStar, FaStar } from "react-icons/fa";

export const ExpandedViewPage: VFC = () => {
  const {
    localThemeList: installedThemes,
    currentExpandedTheme,
    isInstalling,
    apiFullToken,
    themeSearchOpts,
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
        apiToggleStar(fullThemeData.id, isStarred, newToken).then((bool) => {
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
        buttonText = "Reinstall";
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
  const downloadButtonRef = useRef<HTMLElement>(null);
  const [hasBeenFocused, setHasFocused] = useState<boolean>(false);
  useEffect(() => {
    if (downloadButtonRef?.current && !hasBeenFocused) {
      downloadButtonRef.current.focus();
      setHasFocused(true);
    }
  });

  useEffect(() => {
    if (currentExpandedTheme?.id) {
      setLoaded(false);
      setFocusedImage(0);
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

  const [focusedImage, setFocusedImage] = useState<number>(0);

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
    const imageAreaWidth = 556;
    const imageAreaPadding = 16;
    const gapBetweenCarouselAndImage = 8;
    const selectedImageWidth =
      fullThemeData.images.length > 1 ? 434.8 : imageAreaWidth - imageAreaPadding * 2;
    const selectedImageHeight = (selectedImageWidth / 16) * 10;
    const imageCarouselEntryWidth =
      imageAreaWidth - imageAreaPadding * 2 - selectedImageWidth - gapBetweenCarouselAndImage;
    const imageCarouselEntryHeight = (imageCarouselEntryWidth / 16) * 10;

    // This returns 'installed', 'outdated', or 'uninstalled'
    const installStatus = checkIfThemeInstalled(fullThemeData);
    return (
      <>
        <ExpandedViewStyles
          {...{
            imageAreaWidth,
            imageAreaPadding,
            gapBetweenCarouselAndImage,
            selectedImageHeight,
            selectedImageWidth,
            imageCarouselEntryHeight,
            imageCarouselEntryWidth,
          }}
        />
        <Focusable className="top-offset padding-horiz-1 gap-1 flex bg-storeBg justify-between">
          <ScrollPanelGroup
            // @ts-ignore
            focusable={false}
            className="flex blurry-valve-footer-offset"
            // onCancelButton doesn't work here
            onCancelActionDescription="Back"
            onButtonDown={(evt: any) => {
              if (!evt?.detail?.button) return;
              if (evt.detail.button === 2) {
                Navigation.NavigateBack();
              }
            }}
          >
            {/* Img + Info */}
            <Focusable className="flex-col theme-data-container">
              {/* Images */}
              <Focusable className="flex image-area-container">
                {/* Vertical Image Carousel */}
                {fullThemeData.images.length > 1 && (
                  <ScrollPanelGroup
                    // @ts-ignore
                    focusable={false}
                    className="image-carousel-container"
                  >
                    {fullThemeData.images.map((e, id) => {
                      return (
                        <Focusable
                          onFocus={() => {
                            setFocusedImage(id);
                          }}
                          className="image-carousel-entry"
                          focusWithinClassName="gpfocuswithin"
                          onActivate={() => {}}
                        >
                          <img
                            width={imageCarouselEntryWidth}
                            height={imageCarouselEntryHeight}
                            style={{ objectFit: "contain" }}
                            src={`https://api.deckthemes.com/blobs/${fullThemeData.images[id].id}`}
                          />
                        </Focusable>
                      );
                    })}
                  </ScrollPanelGroup>
                )}

                {/* Selected Image Display */}
                <Focusable
                  className="selected-image"
                  focusWithinClassName="gpfocuswithin"
                  onActivate={() => {}}
                >
                  <img
                    width={selectedImageWidth}
                    height={selectedImageHeight}
                    style={{ objectFit: "contain" }}
                    src={
                      fullThemeData.images.length > 0
                        ? `https://api.deckthemes.com/blobs/${fullThemeData.images?.[focusedImage]?.id}`
                        : `https://share.deckthemes.com/cssplaceholder.png`
                    }
                  />
                  {fullThemeData.images.length > 1 && (
                    <div className="image-number-container">
                      <span className="bold">
                        {focusedImage + 1}/{fullThemeData.images.length}
                      </span>
                    </div>
                  )}
                </Focusable>
              </Focusable>

              <Focusable className="flex flex-col gap-1/4 title-container justify-between">
                {/* Info */}
                <div className="flex flex-col gap-1/4">
                  <div className="flex gap-1/2 items-center">
                    <span className="name-text">{fullThemeData.displayName}</span>
                    <span className="bold text-lg">{fullThemeData.version}</span>
                  </div>
                  <div className="flex gap-1/4 gray-text font-sm">
                    <Focusable
                      onOKActionDescription="View Profile"
                      focusClassName="gpfocuswithin"
                      onActivate={() => {
                        showModal(<AuthorViewModalRoot authorData={fullThemeData.author} />);
                      }}
                    >
                      By <span className="blue-text">{fullThemeData.specifiedAuthor}</span>
                    </Focusable>
                    <span>Last Updated {new Date(fullThemeData.updated).toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Description */}
                <Focusable
                  focusWithinClassName="gpfocuswihtin"
                  className="flex-col gap-1/4"
                  onActivate={() => {}}
                >
                  <span className="bold">Description</span>
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
                </Focusable>
                {/* Targets */}
                <Focusable className="flex-col gap-1/4">
                  <span className="bold">Targets</span>
                  <Focusable className="flex gap-1/4">
                    {fullThemeData.targets.map((e) => (
                      <DialogButton
                        onOKActionDescription={`View Other "${e}" Themes`}
                        onClick={() => {
                          setGlobalState("themeSearchOpts", { ...themeSearchOpts, filters: e });
                          setGlobalState("currentTab", "ThemeBrowser");
                          setGlobalState("forceScrollBackUp", true);
                          Navigation.NavigateBack();
                        }}
                        className="target-text"
                      >
                        {e}
                      </DialogButton>
                    ))}
                  </Focusable>
                </Focusable>
              </Focusable>
            </Focusable>
          </ScrollPanelGroup>
          {/* Buttons */}
          <Focusable className="flex flex-col gap-1 buttons-container">
            <div className="button-bg flex justify-between items-center">
              <div className="flex gap-1/4 items-center">
                {isStarred ? <FaStar /> : <FaRegStar />}
                {/* Need to make the text size smaller or else it wraps */}
                <span style={{ fontSize: fullThemeData.starCount >= 100 ? "0.75em" : "1em" }}>
                  {shortenNumber(fullThemeData.starCount) ?? fullThemeData.starCount} Star
                  {fullThemeData.starCount === 1 ? "" : "s"}
                </span>
              </div>
              <DialogButton
                className="star-button"
                onClick={toggleStar}
                disabled={blurStarButton || !apiFullToken}
              >
                <div className="flex items-center justify-center gap-1/4">
                  <span>
                    {!apiFullToken ? "Log In to Star" : isStarred ? "Unstar Theme" : "Star Theme"}
                  </span>
                </div>
              </DialogButton>
            </div>
            <div className="flex flex-col gap-1/4 button-bg">
              <span className="install-text">Install {fullThemeData.displayName}</span>
              <span className="bold">
                {shortenNumber(fullThemeData.download.downloadCount) ??
                  fullThemeData.download.downloadCount}{" "}
                Download
                {fullThemeData.download.downloadCount === 1 ? "" : "s"}
              </span>
              <Focusable className="install-button-container">
                <DialogButton
                  // @ts-ignore
                  ref={downloadButtonRef}
                  className="blue-button"
                  disabled={isInstalling}
                  onClick={() => {
                    installTheme(fullThemeData.id);
                  }}
                >
                  <span className="CssLoader_ThemeBrowser_ExpandedView_InstallText">
                    {calcButtonText(installStatus)}
                  </span>
                </DialogButton>
                {installStatus === "installed" && (
                  <DialogButton
                    onClick={() => {
                      showModal(
                        <ThemeSettingsModalRoot
                          selectedTheme={
                            installedThemes.find((e) => e.id === fullThemeData.id)?.id ||
                            // using name here because in submissions id is different
                            installedThemes.find((e) => e.name === fullThemeData.name)!.id
                          }
                        />
                      );
                    }}
                    className="configure-button"
                  >
                    <ImCog className="absolute-center" />
                  </DialogButton>
                )}
              </Focusable>
            </div>
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
