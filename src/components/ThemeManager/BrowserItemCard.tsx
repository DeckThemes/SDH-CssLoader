import { FC } from "react";
import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { Focusable, Router } from "decky-frontend-lib";
import { AiOutlineDownload } from "react-icons/ai";
import { PartialCSSThemeInfo, ThemeQueryRequest } from "../../apiTypes";
import { BsCloudDownload, BsStar } from "react-icons/bs";
import { FiTarget } from "react-icons/fi";

const cardWidth = {
  5: 152,
  4: 195,
  3: 260,
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
          <div className="CSSLoader_ThemeCard_NotifBubble">
            <AiOutlineDownload className="CSSLoader_ThemeCard_BubbleIcon" />
          </div>
        )}
        <Focusable
          className={`CSSLoader_ThemeCard_Container`}
          ref={refPassthrough}
          focusWithinClassName="gpfocuswithin"
          onActivate={() => {
            setGlobalState(prevSearchOptsVarName, searchOpts);
            setGlobalState("currentExpandedTheme", e);
            Router.Navigate("/cssloader/expanded-view");
          }}
        >
          <div className={`CSSLoader_ThemeCard_ImageContainer`}>
            <img
              className="CSSLoader_ThemeCard_Image"
              src={imageURLCreator().slice(4, -1)}
              width={cardWidth[size]}
              height={(cardWidth[size] / 16) * 10}
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
