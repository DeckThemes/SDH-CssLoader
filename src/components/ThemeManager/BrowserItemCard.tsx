import { FC } from "react";
import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { Focusable, Router } from "decky-frontend-lib";
import { AiOutlineDownload } from "react-icons/ai";
import { PartialCSSThemeInfo, ThemeQueryRequest } from "../../apiTypes";
import { BsCloudDownload, BsStar } from "react-icons/bs";
import { FiTarget } from "react-icons/fi";

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
  function imageURLCreator(): string {
    if (e?.images[0]?.id && e.images[0].id !== "MISSING") {
      return `url(${apiUrl}/blobs/${e?.images[0].id})`;
    } else {
      return `url(https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Steam_Deck_logo_%28blue_background%29.svg/2048px-Steam_Deck_logo_%28blue_background%29.svg.png)`;
    }
  }

  const installStatus = checkIfThemeInstalled(e);

  return (
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
          className="CSSLoader_ThemeCard_Container"
          ref={refPassthrough}
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setGlobalState(prevSearchOptsVarName, searchOpts);
            setGlobalState("currentExpandedTheme", e);
            Router.Navigate("/cssloader/expanded-view");
          }}
        >
          <div className="CSSLoader_ThemeCard_ImageContainer">
            <img
              className="CSSLoader_ThemeCard_Image"
              src={imageURLCreator().slice(4, -1)}
              width={260}
              height={(260 / 16) * 10}
            />
            <div className="CSSLoader_ThemeCard_ImageDarkener" />
            <div className="CSSLoader_ThemeCard_SupInfoContainer">
              <div className="CSSLoader_ThemeCard_IconInfoContainer">
                <BsCloudDownload />
                <span>{e.download.downloadCount}</span>
              </div>
              <div className="CSSLoader_ThemeCard_IconInfoContainer">
                <BsStar />
                <span>{e.starCount}</span>
              </div>
              <div className="CSSLoader_ThemeCard_IconInfoContainer">
                <FiTarget />
                <span>{e.target}</span>
              </div>
            </div>
          </div>
          <div className="CSSLoader_ThemeCard_MainInfoContainer">
            <span className="CSSLoader_ThemeCard_Title">{e.displayName}</span>
            <span className="CSSLoader_ThemeCard_SubTitle">
              {e.version} - Last Updated {new Date(e.updated).toLocaleDateString()}
            </span>
            <span className="CSSLoader_ThemeCard_SubTitle">By {e.specifiedAuthor}</span>
          </div>
        </Focusable>
      </div>
    </>
  );
};
