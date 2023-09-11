import { Tabs } from "decky-frontend-lib";
import { Permissions } from "../../apiTypes";
import { useCssLoaderState } from "../../state";
import { LogInPage } from "./LogInPage";
import { StarredThemesPage } from "./StarredThemesPage";
import { SubmissionsPage } from "./SubmissionBrowserPage";
import { ThemeBrowserPage } from "./ThemeBrowserPage";
export function ThemeManagerRouter() {
  const { apiMeData, currentTab, setGlobalState } = useCssLoaderState();
  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0e141b",
      }}
    >
      <style>
        {`
          .CSSLoader_ThemeCard_Container {
            width: ${260}px;
            display: flex;
            flex-direction: column;
            background-color: #ACB2C924;
            overflow: hidden;
          }
          .gpfocuswithin.CSSLoader_ThemeCard_Container {
            background-color: #ACB2C947;
          }
          .CSSLoader_ThemeCard_ImageContainer {
            overflow: hidden;
            position: relative;
            width: ${260}px;
            height: ${(260 / 16) * 10}px;
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
          }
          .CSSLoader_ThemeCard_Image {
            object-fit: cover;
            transition-property: filter,transform;
            transition-duration: 0.32s;
            transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
          }
          .gpfocuswithin > div > .CSSLoader_ThemeCard_Image {
            filter: saturate(0);
            transform: scale(1.03);
            transition-delay: 0.1s;
          }
          .CSSLoader_ThemeCard_ImageDarkener {
            position: absolute;
            top: 0;
            left: 0;
            width: ${260}px;
            height: ${(260 / 16) * 10}px;
            opacity: 0;
            transition-property: opacity;
            transition-duration: 0.65s;
            transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
            background-color: #0056d6;
            mix-blend-mode: multiply;
          }
          .gpfocuswithin > div > .CSSLoader_ThemeCard_ImageDarkener {
            opacity: 1;
          }
          .CSSLoader_ThemeCard_Title {
            font-weight: bold;
            text-overflow: ellipsis;
            overflow: hidden;
            whitespace: nowrap;
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
      <Tabs
        activeTab={currentTab}
        onShowTab={(tabID: string) => {
          setGlobalState("currentTab", tabID);
        }}
        tabs={[
          {
            title: "All Themes",
            content: <ThemeBrowserPage />,
            id: "ThemeBrowser",
          },
          ...(!!apiMeData
            ? [
                {
                  title: "Starred Themes",
                  content: <StarredThemesPage />,
                  id: "StarredThemes",
                },
                ...(apiMeData.permissions.includes(Permissions.viewSubs)
                  ? [
                      {
                        title: "Submissions",
                        content: <SubmissionsPage />,
                        id: "SubmissionsPage",
                      },
                    ]
                  : []),
              ]
            : []),
          {
            title: "DeckThemes Account",
            content: <LogInPage />,
            id: "LogInPage",
          },
        ]}
      />
    </div>
  );
}
