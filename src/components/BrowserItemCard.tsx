import { FC } from "react";
import { useCssLoaderState } from "../state";
import { Theme } from "../theme";
import { Focusable, Router } from "decky-frontend-lib";
import { AiOutlineDownload } from "react-icons/ai";
import { PartialCSSThemeInfo, ThemeQueryRequest } from "../apiTypes";

const topMargin = {
  5: "2px",
  4: "3px",
  3: "5px",
};

const bottomMargin = {
  5: "4px",
  4: "6px",
  3: "8px",
};

const cardWidth = {
  5: "152px",
  4: "195px",
  3: "260px",
};

const imgWidth = {
  5: "140.2px",
  4: "180px",
  3: "240px",
};

const imgHeight = {
  5: "87.6px",
  4: "112.5px",
  3: "150px",
};

const targetHeight = {
  5: "12px",
  4: "18px",
  3: "25px",
};

const bubbleOffset = {
  5: "-5px",
  4: "-7.5px",
  3: "-10px",
};

const bubblePadding = {
  5: "4px 5px 2.5px",
  4: "4px 6px 2px",
  3: "5px 8px 2.5px 8px",
};

const bigText = {
  5: "0.75em",
  4: "1em",
  3: "1.25em",
};

const smallText = {
  5: "0.5em",
  4: "0.75em",
  3: "1em",
};

export const VariableSizeCard: FC<{
  data: PartialCSSThemeInfo;
  cols: number;
  showTarget: boolean;
  searchOpts: ThemeQueryRequest;
  prevSearchOptsVarName: string;
  refPassthrough?: any;
}> = ({
  data: e,
  cols: size,
  showTarget = true,
  refPassthrough = undefined,
  searchOpts,
  prevSearchOptsVarName,
}) => {
  const { localThemeList, apiUrl, setGlobalState } = useCssLoaderState();
  function checkIfThemeInstalled(themeObj: PartialCSSThemeInfo) {
    const filteredArr: Theme[] = localThemeList.filter(
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
  function imageURLCreator(): string {
    if (e?.images[0]?.id && e.images[0].id !== "MISSING") {
      return `url(${apiUrl}/blobs/${e?.images[0].id})`;
    } else {
      return `url(https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Steam_Deck_logo_%28blue_background%29.svg/2048px-Steam_Deck_logo_%28blue_background%29.svg.png)`;
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
              top: bubbleOffset[size],
              left: bubbleOffset[size],
              padding: bubblePadding[size],
              fontSize: smallText[size],
              background: "linear-gradient(135deg, #3a9bed, #235ecf)",
              borderRadius: "50%",
              // The focusRing has a z index of 10000, so this is just to be cheeky
              zIndex: "10001",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
          >
            <AiOutlineDownload />
          </div>
        )}
        <Focusable
          ref={refPassthrough}
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setGlobalState(prevSearchOptsVarName, searchOpts);
            setGlobalState("currentExpandedTheme", e);
            Router.Navigate("/theme-manager-expanded-view");
          }}
          className="CssLoader_ThemeBrowser_SingleItem_BgImage"
          style={{
            backgroundImage: imageURLCreator(),
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: cardWidth[size],
            borderRadius: "5px",
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
                marginTop: topMargin[size],
                fontSize: bigText[size],
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
            {showTarget && (
              <span
                className="CssLoader_ThemeBrowser_SingleItem_ThemeTarget"
                style={{
                  marginTop: "-6px",
                  fontSize: smallText[size],
                  height: targetHeight[size],
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                }}
              >
                {e.target}
              </span>
            )}
            <div
              className="CssLoader_ThemeBrowser_SingleItem_PreviewImage"
              style={{
                width: imgWidth[size],
                backgroundImage: imageURLCreator(),
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: imgHeight[size],
                display: "flex",
                position: "relative",
                flexDirection: "column",
                alignItems: "center",
              }}
            />
            <div
              className="CssLoader_ThemeBrowser_SingleItem_AuthorVersionContainer"
              style={{
                width: imgWidth[size],
                textAlign: "center",
                display: "flex",
                paddingBottom: bottomMargin[size],
                fontSize: smallText[size],
              }}
            >
              <span
                className="CssLoader_ThemeBrowser_SingleItem_AuthorText"
                style={{
                  marginRight: "auto",
                  marginLeft: "2px",
                  textShadow: "rgb(48, 48, 48) 0px 0 10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "80%",
                  textAlign: "start",
                }}
              >
                {e.specifiedAuthor}
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
