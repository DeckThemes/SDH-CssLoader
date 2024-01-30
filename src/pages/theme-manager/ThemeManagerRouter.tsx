import { Tabs } from "decky-frontend-lib";
import { Permissions } from "../../apiTypes";
import { useCssLoaderState } from "../../state";
import { LogInPage } from "./LogInPage";
import { StarredThemesPage } from "./StarredThemesPage";
import { SubmissionsPage } from "./SubmissionBrowserPage";
import { ThemeBrowserPage } from "./ThemeBrowserPage";
import { ThemeBrowserCardStyles } from "../../components/Styles";
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
      <ThemeBrowserCardStyles />
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
