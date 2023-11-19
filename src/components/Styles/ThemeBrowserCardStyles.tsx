import { useCssLoaderState } from "../../state";

export function ThemeBrowserCardStyles({ customCardSize }: { customCardSize?: number }) {
  const { browserCardSize } = customCardSize
    ? { browserCardSize: customCardSize }
    : useCssLoaderState();

  return (
    <style>
      {`
      :root {
        --cssloader-themecard-width: ${
          browserCardSize === 3 ? "260px" : browserCardSize === 4 ? "195px" : "152px"
        };
        --cssloader-themecard-imgheight: ${
          browserCardSize === 3
            ? (260 / 16) * 10 + "px"
            : browserCardSize === 4
            ? (195 / 16) * 10 + "px"
            : (152 / 16) * 10 + "px"
        };
        --cssloader-themecard-fontsize: ${
          browserCardSize === 3 ? "1em" : browserCardSize === 4 ? "0.75em" : "0.5em"
        };
        --cssloader-themecard-bubblesize: ${
          browserCardSize === 3 ? "40px" : browserCardSize === 4 ? "30px" : "20px"
        };
      }
      .CSSLoader_ThemeCard_NotifBubble {
        position: absolute;
        background: linear-gradient(135deg, #fca904 50%, transparent 51%);
        z-index: 10001;
        left: 0;
        top: 0;
        color: black;
        font-size: var(--cssloader-themecard-fontsize);
        width: var(--cssloader-themecard-bubblesize);
        height: var(--cssloader-themecard-bubblesize);
      }
      .CSSLoader_ThemeCard_BubbleIcon {
        padding: 0.25em;
      }
      .CSSLoader_ThemeCard_Container {
        display: flex;
        flex-direction: column;
        background-color: #ACB2C924;
        overflow: hidden;
        width: var(--cssloader-themecard-width);
      }
      .gpfocuswithin.CSSLoader_ThemeCard_Container {
        background-color: #ACB2C947;
      }
      .CSSLoader_ThemeCard_ImageContainer {
        overflow: hidden;
        position: relative;
        width: var(--cssloader-themecard-width);
        height: var(--cssloader-themecard-imgheight);
      }
      .CSSLoader_ThemeCard_SupInfoContainer {
        display: flex;
        gap: 0.5em;
        width: 100%;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 0;
        transform: translateY(100%);
        opacity: 0;
        transition-property: transform,opacity;
        transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
        transition-duration: 0.15s;
        font-size: var(--cssloader-themecard-fontsize);
      }
      .gpfocuswithin > div > .CSSLoader_ThemeCard_SupInfoContainer {
        transform: translateY(0);
        opacity: 1;
        transition-delay: 0.1s;
      }
      .CSSLoader_ThemeCard_MainInfoContainer {
        display: flex;
        flex-direction: column;
        padding: 0.5em;
        font-size: var(--cssloader-themecard-fontsize);
      }
      .CSSLoader_ThemeCard_Image {
        object-fit: cover;
        transition-property: filter,transform;
        transition-duration: 0.32s;
        transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
      }
      .CSSLoader_ThemeCard_ImageDarkener {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transition-property: opacity;
        transition-duration: 0.65s;
        transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
        background: linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 30%);
        mix-blend-mode: multiply;
        width: var(--cssloader-themecard-width);
        height: var(--cssloader-themecard-imgheight);
      }
      .gpfocuswithin > div > .CSSLoader_ThemeCard_ImageDarkener {
        opacity: 1;
      }
      .CSSLoader_ThemeCard_Title {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .CSSLoader_ThemeCard_IconInfoContainer {
        display: flex;
        gap: 0.25em;
        align-items: center;
      }
      .CSSLoader_ThemeCard_SubTitle {
        font-size: 0.75em;
      }
    `}
    </style>
  );
}
