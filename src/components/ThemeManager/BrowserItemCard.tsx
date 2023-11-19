import { FC } from "react";
import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { Focusable, Navigation } from "decky-frontend-lib";
import { AiOutlineDownload } from "react-icons/ai";
import { PartialCSSThemeInfo, ThemeQueryRequest } from "../../apiTypes";
import { FaBullseye, FaDownload, FaStar } from "react-icons/fa";
import { shortenNumber } from "../../logic/numbers";

const cardWidth = {
  5: 152,
  4: 195,
  3: 260,
};

export const VariableSizeCard: FC<{
  data: PartialCSSThemeInfo;
  cols: number;
  searchOpts?: ThemeQueryRequest;
  prevSearchOptsVarName?: string;
  refPassthrough?: any;
  onClick?: () => void;
}> = ({
  data: e,
  cols: size,
  refPassthrough = undefined,
  searchOpts,
  prevSearchOptsVarName,
  onClick,
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
            if (onClick) {
              onClick();
              return;
            }
            if (searchOpts && prevSearchOptsVarName) {
              setGlobalState(prevSearchOptsVarName, searchOpts);
            }
            setGlobalState("currentExpandedTheme", e);
            Navigation.Navigate("/cssloader/expanded-view");
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
                <FaDownload />
                <span>{shortenNumber(e.download.downloadCount) ?? e.download.downloadCount}</span>
              </div>
              <div className="CSSLoader_ThemeCard_IconInfoContainer">
                <FaStar />
                <span>{shortenNumber(e.starCount) ?? e.starCount}</span>
              </div>
              <div className="CSSLoader_ThemeCard_IconInfoContainer">
                <FaBullseye />
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
