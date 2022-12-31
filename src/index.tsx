import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  Tabs,
  Router,
} from "decky-frontend-lib";
import { useEffect, useState, FC } from "react";
import * as python from "./python";
import { RiPaintFill } from "react-icons/ri";

import {
  SettingsPage,
  StarredThemesPage,
  SubmissionsPage,
  ThemeBrowserPage,
  UninstallThemePage,
} from "./theme-manager";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import { ThemeToggle } from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";
import { Permissions } from "./apiTypes";

var firstTime: boolean = true;

const Content: FC<{ serverAPI: ServerAPI }> = () => {
  // Originally, when SuchMeme wrote this, the names themeList, themeListInternal, and setThemeList were used for the getter and setter functions
  // These were renamed when state was moved to the context, but I simply re-defined them here as their original names so that none of the original code broke
  const { localThemeList: themeList, setLocalThemeList: setThemeList } = useCssLoaderState();

  // setThemeList is a function that takes the raw data from the python function and then formats it with init and generate functions
  // This still exists, it just has been moved into the CssLoaderState class' setter function, so it now happens automatically

  const [dummyFuncResult, setDummyResult] = useState<boolean>(false);

  const reload = function () {
    python.resolve(python.getThemes(), setThemeList);
    dummyFuncTest();
  };

  if (firstTime) {
    firstTime = false;
    reload();
  }

  function dummyFuncTest() {
    python.resolve(python.dummyFunction(), setDummyResult);
  }

  useEffect(() => {
    dummyFuncTest();
  }, []);

  return (
    <PanelSection title="Themes">
      {dummyFuncResult ? (
        <>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                Router.CloseSideMenus();
                Router.Navigate("/theme-manager");
              }}
            >
              Manage Themes
            </ButtonItem>
          </PanelSectionRow>
          {themeList.map((x) => (
            <ThemeToggle data={x} setThemeList={setThemeList} />
          ))}
        </>
      ) : (
        <PanelSectionRow>
          <span>
            CssLoader failed to initialize, try reloading, and if that doesn't work, try restarting
            your deck.
          </span>
        </PanelSectionRow>
      )}

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            python.resolve(python.reset(), () => reload());
          }}
        >
          Reload Themes
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ThemeManagerRouter: FC = () => {
  const { apiShortToken, apiMeData, currentTab, setGlobalState } = useCssLoaderState();
  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0005",
      }}
    >
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
          ...(!!apiShortToken && apiShortToken.length === 12
            ? [
                {
                  title: "Starred Themes",
                  content: <StarredThemesPage />,
                  id: "StarredThemes",
                },
              ]
            : []),
          ...(!!apiMeData && apiMeData.permissions.includes(Permissions.viewSubs)
            ? [
                {
                  title: "Submissions",
                  content: <SubmissionsPage />,
                  id: "SubmissionsPage",
                },
              ]
            : []),
          {
            title: "Installed Themes",
            content: <UninstallThemePage />,
            id: "InstalledThemes",
          },
          {
            title: "Settings",
            content: <SettingsPage />,
            id: "SettingsPage",
          },
        ]}
      />
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);

  const state: CssLoaderState = new CssLoaderState();

  python.resolve(python.storeRead("shortToken"), (token: string) => {
    if (token) {
      state.setGlobalState("apiShortToken", token);
    }
  });

  serverApi.routerHook.addRoute("/theme-manager", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ThemeManagerRouter />
    </CssLoaderContextProvider>
  ));

  serverApi.routerHook.addRoute("/theme-manager-expanded-view", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ExpandedViewPage />
    </CssLoaderContextProvider>
  ));

  return {
    title: <div className={staticClasses.Title}>CSS Loader</div>,
    alwaysRender: true,
    content: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <Content serverAPI={serverApi} />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
  };
});
