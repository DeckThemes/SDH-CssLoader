import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  SidebarNavigation,
  Router,
} from "decky-frontend-lib";
import { VFC } from "react";
import * as python from "./python";
import { RiPaintFill } from "react-icons/ri";

import { ThemeBrowserPage } from "./theme-manager";
import {
  CssLoaderContextProvider,
  CssLoaderState,
  useCssLoaderState,
} from "./state/CssLoaderState";
import { UninstallThemePage } from "./theme-manager/UninstallThemePage";
import { ThemeToggle } from "./components/ThemeToggle";

var firstTime: boolean = true;

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  // Originally, when SuchMeme wrote this, the names themeList, themeListInternal, and setThemeList were used for the getter and setter functions
  // These were renamed when state was moved to the context, but I simply re-defined them here as their original names so that none of the original code broke
  const { localThemeList: themeList, setLocalThemeList: setThemeList } =
    useCssLoaderState();

  // setThemeList is a function that takes the raw data from the python function and then formats it with init and generate functions
  // This still exists, it just has been moved into the CssLoaderState class' setter function, so it now happens automatically

  const reload = function () {
    python.resolve(python.getThemes(), setThemeList);
  };

  if (firstTime) {
    firstTime = false;
    reload();
  }

  return (
    <PanelSection title='Themes'>
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/theme-manager");
          }}>
          Manage Themes
        </ButtonItem>
      </PanelSectionRow>
      {themeList.map((x) => (
        <ThemeToggle data={x} setThemeList={setThemeList} />
      ))}
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            python.resolve(python.reset(), () => reload());
          }}>
          Reload themes
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ThemeManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title='Theme Manager'
      showTitle
      pages={[
        {
          title: "Browse Themes",
          content: <ThemeBrowserPage />,
          route: "/theme-manager/browser",
        },
        {
          title: "Uninstall Themes",
          content: <UninstallThemePage />,
          route: "/theme-manager/uninstall",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);

  const state: CssLoaderState = new CssLoaderState();

  serverApi.routerHook.addRoute("/theme-manager", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ThemeManagerRouter />
    </CssLoaderContextProvider>
  ));

  return {
    title: <div className={staticClasses.Title}>Css Loader</div>,
    content: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <Content serverAPI={serverApi} />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
  };
});
