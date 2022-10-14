import { FC } from "react";
import { browseThemeEntry } from "../customTypes";
import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { Focusable, Router } from "decky-frontend-lib";
import { AiOutlineDownload } from "react-icons/ai";

export const ThreeWideCard: FC<{ data: browseThemeEntry }> = ({ data: e }) => {
  const { localThemeList, setCurExpandedTheme } = useCssLoaderState();
  function checkIfThemeInstalled(themeObj: browseThemeEntry) {
    const filteredArr: Theme[] = localThemeList.filter(
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

  const installStatus = checkIfThemeInstalled(e);
  return (
    // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
    <>
      <div style={{ position: "relative" }}>
        {installStatus === "outdated" && (
          <div
            className="CssLoader_ThemeBrowser_SingleItem_NotifBubble"
            style={{
              position: "absolute",
              top: "-10px",
              left: "-10px",
              padding: "5px 8px 2.5px 8px",
              background: "linear-gradient(135deg, #3a9bed, #235ecf)",
              borderRadius: "50%",
              // The focusRing has a z index of 10000, so this is just to be cheeky
              zIndex: "10001",
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
          >
            <AiOutlineDownload />
          </div>
        )}
        <Focusable
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setCurExpandedTheme(e);
            Router.Navigate("/theme-manager-expanded-view");
          }}
          className="CssLoader_ThemeBrowser_SingleItem_BgImage"
          style={{
            backgroundImage: 'url("' + e.preview_image + '")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "260px",
            borderRadius: "5px",
            marginLeft: "0px",
            marginRight: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            className="CssLoader_ThemeBrowser_SingleItem_BgOverlay"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "RGBA(0,0,0,0.8)",
              backdropFilter: "blur(5px)",
              width: "100%",
              height: "100%",
              borderRadius: "3px",
            }}
          >
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeName"
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
              }}
            >
              {e.name}
            </span>
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeTarget"
              style={{
                marginTop: "-6px",
                fontSize: "1em",
                height: "25px",
                textShadow: "rgb(48, 48, 48) 0px 0 10px",
              }}
            >
              {e.target}
            </span>
            <div
              className="CssLoader_ThemeBrowser_SingleItem_PreviewImage"
              style={{
                width: "240px",
                backgroundImage: 'url("' + e.preview_image + '")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: "150px",
                display: "flex",
                position: "relative",
                flexDirection: "column",
                alignItems: "center",
              }}
            />
            <div
              className="CssLoader_ThemeBrowser_SingleItem_AuthorVersionContainer"
              style={{
                width: "240px",
                textAlign: "center",
                display: "flex",
                paddingBottom: "8px",
                fontSize: "1em",
              }}
            >
              <span
                className="CssLoader_ThemeBrowser_SingleItem_AuthorText"
                style={{
                  marginRight: "auto",
                  marginLeft: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.author}
              </span>
              <span
                className="CssLoader_ThemeBrowser_SingleItem_VersionText"
                style={{
                  marginLeft: "auto",
                  marginRight: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.version}
              </span>
            </div>
          </div>
        </Focusable>
      </div>
    </>
  );
};

export const FourWideCard: FC<{ data: browseThemeEntry }> = ({ data: e }) => {
  const { localThemeList, setCurExpandedTheme } = useCssLoaderState();
  function checkIfThemeInstalled(themeObj: browseThemeEntry) {
    const filteredArr: Theme[] = localThemeList.filter(
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

  const installStatus = checkIfThemeInstalled(e);
  return (
    // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
    <>
      <div style={{ position: "relative" }}>
        {installStatus === "outdated" && (
          <div
            className="CssLoader_ThemeBrowser_SingleItem_NotifBubble"
            style={{
              position: "absolute",
              top: "-7.5px",
              left: "-7.5px",
              padding: "4px 6px 2px",
              background: "linear-gradient(135deg, #3a9bed, #235ecf)",
              borderRadius: "50%",
              // The focusRing has a z index of 10000, so this is just to be cheeky
              zIndex: "10001",
              fontSize: "0.75em",
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
          >
            <AiOutlineDownload />
          </div>
        )}
        <Focusable
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setCurExpandedTheme(e);
            Router.Navigate("/theme-manager-expanded-view");
          }}
          className="CssLoader_ThemeBrowser_SingleItem_BgImage"
          style={{
            backgroundImage: 'url("' + e.preview_image + '")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "195px",
            borderRadius: "5px",
            marginLeft: "0px",
            marginRight: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            className="CssLoader_ThemeBrowser_SingleItem_BgOverlay"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "RGBA(0,0,0,0.8)",
              backdropFilter: "blur(5px)",
              width: "100%",
              height: "100%",
              borderRadius: "3px",
            }}
          >
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeName"
              style={{
                textAlign: "center",
                marginTop: "5px",
                fontSize: "1em",
                fontWeight: "bold",
                // This stuff here truncates it if it's too long
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "90%",
              }}
            >
              {e.name}
            </span>
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeTarget"
              style={{
                marginTop: "-6px",
                fontSize: "0.75em",
                textShadow: "rgb(48, 48, 48) 0px 0 10px",
              }}
            >
              {e.target}
            </span>
            <div
              className="CssLoader_ThemeBrowser_SingleItem_PreviewImage"
              style={{
                width: "180px",
                backgroundImage: 'url("' + e.preview_image + '")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: "112.5px",
                display: "flex",
                position: "relative",
                flexDirection: "column",
                alignItems: "center",
              }}
            />
            <div
              className="CssLoader_ThemeBrowser_SingleItem_AuthorVersionContainer"
              style={{
                width: "180px",
                textAlign: "center",
                display: "flex",
                paddingBottom: "8px",
                fontSize: "0.75em",
              }}
            >
              <span
                className="CssLoader_ThemeBrowser_SingleItem_AuthorText"
                style={{
                  marginRight: "auto",
                  marginLeft: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.author}
              </span>
              <span
                className="CssLoader_ThemeBrowser_SingleItem_VersionText"
                style={{
                  marginLeft: "auto",
                  marginRight: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.version}
              </span>
            </div>
          </div>
        </Focusable>
      </div>
    </>
  );
};

export const FiveWideCard: FC<{ data: browseThemeEntry }> = ({ data: e }) => {
  const { localThemeList, setCurExpandedTheme } = useCssLoaderState();
  function checkIfThemeInstalled(themeObj: browseThemeEntry) {
    const filteredArr: Theme[] = localThemeList.filter(
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

  const installStatus = checkIfThemeInstalled(e);
  return (
    // The outer 2 most divs are the background darkened/blurred image, and everything inside is the text/image/buttons
    <>
      <div style={{ position: "relative" }}>
        {installStatus === "outdated" && (
          <div
            className="CssLoader_ThemeBrowser_SingleItem_NotifBubble"
            style={{
              position: "absolute",
              top: "-5px",
              left: "-5px",
              padding: "4px 5px 2.5px",
              background: "linear-gradient(135deg, #3a9bed, #235ecf)",
              borderRadius: "50%",
              // The focusRing has a z index of 10000, so this is just to be cheeky
              zIndex: "10001",
              fontSize: "0.5em",
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
          >
            <AiOutlineDownload />
          </div>
        )}
        <Focusable
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setCurExpandedTheme(e);
            Router.Navigate("/theme-manager-expanded-view");
          }}
          className="CssLoader_ThemeBrowser_SingleItem_BgImage"
          style={{
            backgroundImage: 'url("' + e.preview_image + '")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "146.25px",
            borderRadius: "5px",
            marginLeft: "0px",
            marginRight: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            className="CssLoader_ThemeBrowser_SingleItem_BgOverlay"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "RGBA(0,0,0,0.8)",
              backdropFilter: "blur(5px)",
              width: "100%",
              height: "100%",
              borderRadius: "3px",
            }}
          >
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeName"
              style={{
                textAlign: "center",
                marginTop: "5px",
                fontSize: "0.75em",
                fontWeight: "bold",
                // This stuff here truncates it if it's too long
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "90%",
              }}
            >
              {e.name}
            </span>
            <span
              className="CssLoader_ThemeBrowser_SingleItem_ThemeTarget"
              style={{
                marginTop: "-6px",
                fontSize: "0.5em",
                textShadow: "rgb(48, 48, 48) 0px 0 10px",
              }}
            >
              {e.target}
            </span>
            <div
              className="CssLoader_ThemeBrowser_SingleItem_PreviewImage"
              style={{
                width: "135px",
                backgroundImage: 'url("' + e.preview_image + '")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: "84.375px",
                display: "flex",
                position: "relative",
                flexDirection: "column",
                alignItems: "center",
              }}
            />
            <div
              className="CssLoader_ThemeBrowser_SingleItem_AuthorVersionContainer"
              style={{
                width: "135px",
                textAlign: "center",
                display: "flex",
                paddingBottom: "8px",
                fontSize: "0.5em",
              }}
            >
              <span
                className="CssLoader_ThemeBrowser_SingleItem_AuthorText"
                style={{
                  marginRight: "auto",
                  marginLeft: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.author}
              </span>
              <span
                className="CssLoader_ThemeBrowser_SingleItem_VersionText"
                style={{
                  marginLeft: "auto",
                  marginRight: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.version}
              </span>
            </div>
          </div>
        </Focusable>
      </div>
    </>
  );
};
