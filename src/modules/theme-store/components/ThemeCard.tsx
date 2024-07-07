import { PartialCSSThemeInfo } from "@/types";
import {
  ColumnNumbers,
  useThemeBrowserSharedStateValue,
  useThemeBrowserStoreValue,
} from "../context";
import { forwardRef } from "react";
import { shortenNumber, useThemeInstallState } from "@/lib";
import { useCSSLoaderStateValue } from "@/backend";
import { AiOutlineDownload } from "react-icons/ai";
import { Focusable } from "@decky/ui";
import { FaBullseye, FaDownload, FaStar } from "react-icons/fa6";

interface ThemeCardProps {
  theme: PartialCSSThemeInfo;
  size?: ColumnNumbers;
}

const cardWidth = {
  5: 152,
  4: 195,
  3: 260,
};

export const ThemeCard = forwardRef<HTMLDivElement, ThemeCardProps>(({ theme, size }, ref) => {
  const apiUrl = useCSSLoaderStateValue("apiUrl");
  const browserCardSize = useThemeBrowserSharedStateValue("browserCardSize");
  const cols = size ?? browserCardSize;
  const installStatus = useThemeInstallState(theme);

  const imageUrl =
    theme?.images[0]?.id && theme.images[0].id !== "MISSING"
      ? `${apiUrl}/blobs/${theme.images[0].id}`
      : `https://share.deckthemes.com/cssplaceholder.png`;

  return (
    <div className="relative">
      {installStatus === "outdated" && (
        <div className="cl_storeitem_notifbubble">
          <AiOutlineDownload className="cl_storeitem_bubbleicon" />
        </div>
      )}
      <Focusable
        ref={ref}
        className="cl_storeitem_container"
        focusWithinClassName="gpfocuswithin"
        onActivate={() => {
          // ADD IN CLICK LOGIC
        }}
      >
        <div className="cl_storeitem_imagecontainer">
          <img
            className="cl_storeitem_image"
            src={imageUrl}
            width={cardWidth[cols]}
            height={(cardWidth[cols] / 16) * 10}
          />
          <div className="cl_storeitem_imagedarkener" />
          <div className="cl_storeitem_supinfocontainer">
            <div className="cl_storeitem_iconinfoitem">
              <FaDownload />
              <span>
                {shortenNumber(theme.download.downloadCount) ?? theme.download.downloadCount}
              </span>
            </div>
            <div className="cl_storeitem_iconinfoitem">
              <FaStar />
              <span>{shortenNumber(theme.starCount) ?? theme.starCount}</span>
            </div>
            <div className="cl_storeitem_iconinfoitem">
              <FaBullseye />
              <span>{theme.target}</span>
            </div>
          </div>
        </div>
        <div className="cl_storeitem_maininfocontainer">
          <span className="cl_storeitem_title">{theme.displayName}</span>
          <span className="cl_storeitem_subtitle">
            {theme.version} - Last Updated {new Date(theme.updated).toLocaleDateString()}
          </span>
          <span className="cl_storeitem_subtitle">By {theme.specifiedAuthor}</span>
        </div>
      </Focusable>
    </div>
  );
});
