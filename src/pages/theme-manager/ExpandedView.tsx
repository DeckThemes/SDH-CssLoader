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
import { calcButtonColor } from "../../logic";
import { FullCSSThemeInfo, PartialCSSThemeInfo } from "../../apiTypes";
import { ThemeSettingsModalRoot } from "../../components/Modals/ThemeSettingsModal";

export const ExpandedViewPage: VFC = () => {
  const {
    localThemeList: installedThemes,
    currentExpandedTheme,
    isInstalling,
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
      fullThemeData.images.length > 1 ? 406 : imageAreaWidth - imageAreaPadding * 2;
    const selectedImageHeight = (selectedImageWidth / 16) * 10;
    const imageCarouselEntryWidth =
      imageAreaWidth - imageAreaPadding * 2 - selectedImageWidth - gapBetweenCarouselAndImage;
    const imageCarouselEntryHeight = (imageCarouselEntryWidth / 16) * 10;

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
            display: flex;
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
          .text-lg {
            font-size: 1.25em;
          }
          .top-offset {
            margin-top: 40px;
            height: calc(100% - 40px);
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
          .bg-storeBg {
            background: rgb(27, 40, 56);;
          }
          .gap-1 {
            gap: 1em;
          }
          .gap-1\\/4 {
            gap: 0.25em;
          }
          .gap-1\\/2 {
            gap: 0.5em;
          }
          .pb-1 {
            padding-bottom: 1em;
          }
          .flex-1 {
            flex: 1;
          }
          .image-area-container {
            gap: ${gapBetweenCarouselAndImage}px;
            padding: ${imageAreaPadding}px;
          }
          .title-container {
            padding: 1em;
            padding-top: 0;
          }
          .justify-end {
            justify-content: flex-end;
          }
          .overflow-y-auto {
            overflow-y: auto;
          }
          .buttons-container {
            position: sticky;
            padding-top: 1em;
            flex: 1;
          }
          .theme-data-container {
            height: max-content;
            min-height: 100%;
            background: rgba(14, 20, 27, 0.8);
            width: ${imageAreaWidth}px;
          }
          .button-bg {
            background: #2a4153;
            padding: 1em;
          }
          .blue-button {
            background: #1a9fff !important;
          }
          .blue-button.gpfocuswithin {
            background: white !important;
          }
          .blue-text {
            color: rgb(26, 159, 255);
          }
          .gray-text {
            color: rgb(124, 142, 163);
          }
          .back-button {
            min-width: 25% !important;
            width: 25% !important;
            align-self: flex-end;
            padding: 10px 0 !important;
          }
          .star-button {
            min-width: 30% !important;
            padding: 8px 12px !important;
            width: fit-content !important;
          }
          .padding-horiz-1 {
            padding-left: 1em;
            padding-right: 1em;
          }
          .selected-image {
            width: ${selectedImageWidth}px;
            height: ${selectedImageHeight}px;
            position: relative;
          }
          .image-carousel-entry {
            width: ${imageCarouselEntryWidth}px;
            height: ${imageCarouselEntryHeight}px;
            position: relative;
          }
          .image-carousel-container {
            width: ${imageCarouselEntryWidth}px;
            height: ${selectedImageHeight}px;
            display: flex;
            justify-content: space-around;
            flex-direction: column;
          }
          .image-number-container {
            width: 3em;
            height: 2em;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000a;
            position: absolute;
            bottom: 1em;
            right: 1em;
          }
          .install-text {
            width: 200px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .name-text {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            font-size: 1.5em;
            font-weight: bold;
          }
          .target-text {
            background: rgba(59, 90, 114, 0.5);
            color: rgb(26, 159, 255);
            padding: 8px 12px;
            border-radius: 2px;
          }
          .install-button-container {
            display: flex;
            gap: 0.25em;
          }
          .configure-button {
            width: 1em !important;
            min-width: 1em !important;
            position: relative;
          }
          .absolute-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          `}
        </style>

        <Focusable className="top-offset padding-horiz-1 gap-1 flex bg-storeBg justify-between">
          <ScrollPanelGroup
            // @ts-ignore
            focusable={false}
            className="flex"
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
                    src={`https://api.deckthemes.com/blobs/${fullThemeData.images[focusedImage].id}`}
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
                    <span>
                      By <span className="blue-text">{fullThemeData.specifiedAuthor}</span>
                    </span>
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
                <Focusable
                  focusWithinClassName="gpfocuswihtin"
                  className="flex-col gap-1/4"
                  onActivate={() => {}}
                >
                  <span className="bold">Targets</span>
                  <div className="flex gap-1/4">
                    {fullThemeData.targets.map((e) => (
                      <span className="target-text">{e}</span>
                    ))}
                  </div>
                </Focusable>
              </Focusable>
            </Focusable>
          </ScrollPanelGroup>
          {/* Buttons */}
          <Focusable className="flex flex-col gap-1 buttons-container">
            <div className="button-bg flex justify-between items-center">
              <div className="flex gap-1/4 items-center">
                {isStarred ? <BsStarFill /> : <BsStar />}
                {/* Need to make the text size smaller or else it wraps */}
                <span style={{ fontSize: fullThemeData.starCount >= 100 ? "0.75em" : "1em" }}>
                  {fullThemeData.starCount} Star{fullThemeData.starCount === 1 ? "" : "s"}
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
                {fullThemeData.download.downloadCount} Download
                {fullThemeData.download.downloadCount === 1 ? "" : "s"}
              </span>
              <Focusable className="install-button-container">
                <DialogButton
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
            <DialogButton
              className="back-button"
              // @ts-ignore
              ref={backButtonRef}
              onClick={() => {
                setGlobalState("currentExpandedTheme", undefined);
                setFullData(undefined);
                setLoaded(false);
                Navigation.NavigateBack();
              }}
            >
              <span>Back</span>
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
