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
  ThemeBrowserPage,
  UninstallThemePage,
} from "./theme-manager";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import { ThemeToggle } from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";

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
  const [currentTabRoute, setCurrentTabRoute] = useState<string>("ThemeBrowser");

  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0005",
      }}
    >
      <Tabs
        activeTab={currentTabRoute}
        onShowTab={(tabID: string) => {
          setCurrentTabRoute(tabID);
        }}
        tabs={[
          {
            title: "All Themes",
            content: <ThemeBrowserPage />,
            id: "ThemeBrowser",
          },
          {
            title: "Starred Themes",
            content: <StarredThemesPage />,
            id: "StarredThemes",
          },
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
      state.setApiShortToken(token);
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
