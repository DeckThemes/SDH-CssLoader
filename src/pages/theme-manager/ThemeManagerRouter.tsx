import { Tabs } from "decky-frontend-lib";
import { Permissions } from "../../apiTypes";
import { useCssLoaderState } from "../../state";
import { LogInPage } from "./LogInPage";
import { StarredThemesPage } from "./StarredThemesPage";
import { SubmissionsPage } from "./SubmissionBrowserPage";
import { ThemeBrowserPage } from "./ThemeBrowserPage";
import { ThemeBrowserCardStyles } from "../../components/Styles";
import { t } from "../../i18n";

export function ThemeManagerRouter() {
  const { apiMeData, currentTab, setGlobalState, browserCardSize } = useCssLoaderState();
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
            title: t("ALL_THEMES", "All Themes"),
            content: <ThemeBrowserPage />,
            id: "ThemeBrowser",
          },
          ...(!!apiMeData
            ? [
                {
                  title: t("STARRED_THEMES", "Starred Themes"),
                  content: <StarredThemesPage />,
                  id: "StarredThemes",
                },
                ...(apiMeData.permissions.includes(Permissions.viewSubs)
                  ? [
                      {
                        title: t("SUBMISSIONS", "Submissions"),
                        content: <SubmissionsPage />,
                        id: "SubmissionsPage",
                      },
                    ]
                  : []),
              ]
            : []),
          {
            title: t("DECKTHEMES_ACCOUNT", "DeckThemes Account"),
            content: <LogInPage />,
            id: "LogInPage",
          },
        ]}
      />
    </div>
  );
}
