import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  Tabs,
  Router,
  showModal,
  ModalRoot,
} from "decky-frontend-lib";
import { useEffect, useState, FC } from "react";
import * as python from "./python";
import * as api from "./api";
import { RiPaintFill } from "react-icons/ri";

import {
  SettingsPage,
  StarredThemesPage,
  SubmissionsPage,
  ThemeBrowserPage,
  UninstallThemePage,
} from "./theme-manager";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import { AllThemesModalRoot, ThemeToggle } from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";
import { Permissions } from "./apiTypes";
import { Theme } from "./ThemeTypes";

const Content: FC<{ stateClass: CssLoaderState }> = ({ stateClass }) => {
  const { localThemeList: themeList, pinnedThemes } = useCssLoaderState();

  const [dummyFuncResult, setDummyResult] = useState<boolean>(false);

  const reload = function () {
    python.reloadBackend();
    dummyFuncTest();
  };
  function dummyFuncTest() {
    python.resolve(python.dummyFunction(), setDummyResult);
  }

  useEffect(() => {
    dummyFuncTest();
    python.getInstalledThemes();
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
              Download Themes
            </ButtonItem>
          </PanelSectionRow>
          {themeList.length > 0 ? (
            <>
              {pinnedThemes.length > 0 ? (
                <>
                  {themeList
                    .filter((e) => pinnedThemes.includes(e.id))
                    .map((x) => (
                      <ThemeToggle data={x} />
                    ))}
                </>
              ) : (
                <>
                  <span>
                    You have no pinned themes currently, themes that you pin from the "Your Themes"
                    popup will show up here
                  </span>
                </>
              )}
            </>
          ) : (
            <span>You have no themes currently, click on "Download Themes" to download some!</span>
          )}

          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                // @ts-ignore
                showModal(<AllThemesModalRoot stateClass={stateClass} />);
              }}
            >
              Your Themes
            </ButtonItem>
          </PanelSectionRow>
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
        <ButtonItem layout="below" onClick={() => reload()}>
          Refresh
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ThemeManagerRouter: FC = () => {
  const { apiMeData, currentTab, setGlobalState } = useCssLoaderState();
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
  const state: CssLoaderState = new CssLoaderState();
  python.setServer(serverApi);
  python.setStateClass(state);
  api.setServer(serverApi);
  api.setStateClass(state);

  console.log("test1");
  python.resolve(python.getThemes(), (allThemes: Theme[]) => {
    console.log("test2");
    python.resolve(python.storeRead("registeredThemes"), (registeredThemes: string) => {
      console.log("test3");
      python.resolve(python.storeRead("pinnedThemes"), (pinnedThemes: string) => {
        console.log("test4");
        let registerOrig: string[] = registeredThemes ? JSON.parse(registeredThemes) : [];

        let pinClone: string[] = pinnedThemes ? JSON.parse(pinnedThemes) : [];
        let registerClone: string[] = registeredThemes ? JSON.parse(registeredThemes) : [];

        const allIds = allThemes.map((e) => e.id);

        // Adds unregistered themes
        allIds.forEach((e) => {
          if (!registerOrig.includes(e)) {
            console.log(e, " not registered");
            // If the theme hasn't been registered
            registerClone.push(e);
            pinClone.push(e);
          }
        });

        registerOrig.forEach((e) => {
          if (!allIds.includes(e)) {
            console.log(e, " deleted");
            // If the theme is still in the registered array but doesn't exist
            registerClone = registerClone.filter((id) => id !== e);
            pinClone = pinClone.filter((id) => id !== e);
          }
        });

        if (JSON.stringify(pinClone) !== pinnedThemes) {
          console.log("updating store");
          python.storeWrite("pinnedThemes", JSON.stringify(pinClone));
        }
        state.setGlobalState("pinnedThemes", pinClone);
        if (JSON.stringify(registerClone) !== registeredThemes) {
          console.log("updating store");
          python.storeWrite("registeredThemes", JSON.stringify(registerClone));
        }
      });
    });
  });

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
        <Content stateClass={state} />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
  };
});
