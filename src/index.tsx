import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  Tabs,
  Router,
  showModal,
  Focusable,
  Carousel,
} from "decky-frontend-lib";
import { useEffect, useState, FC } from "react";
import * as python from "./python";
import * as api from "./api";
import { RiPaintFill } from "react-icons/ri";

import {
  LogInPage,
  StarredThemesPage,
  SubmissionsPage,
  ThemeBrowserPage,
  UninstallThemePage,
} from "./theme-manager";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import {
  AllThemesModalRoot,
  ThemeToggle,
  // TitleView
} from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";
import { Permissions } from "./apiTypes";
import { Theme } from "./ThemeTypes";

const Content: FC<{ stateClass: CssLoaderState }> = ({ stateClass }) => {
  const { localThemeList: themeList, unpinnedThemes } = useCssLoaderState();

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

  console.log(Carousel);

  return (
    <PanelSection title="Themes">
      {dummyFuncResult ? (
        <>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                Router.CloseSideMenus();
                Router.Navigate("/cssloader/theme-manager");
              }}
            >
              Download Themes
            </ButtonItem>
          </PanelSectionRow>
          {themeList.length > 0 ? (
            <>
              {/* This styles the collapse buttons, putting it here just means it only needs to be rendered once instead of like 20 times */}
              <style>
                {`
                  .CSSLoader_ThemeListContainer {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    width: 100%;
                  }
                  .CSSLoader_QAM_CollapseButton_Container > div > div > div > button {
                    height: 10px !important;
                  }
                `}
              </style>
              <Focusable className="CSSLoader_ThemeListContainer">
                {unpinnedThemes.length === themeList.length ? (
                  <>
                    <span>
                      You have no pinned themes currently, themes that you pin from the "Your
                      Themes" popup will show up here
                    </span>
                  </>
                ) : (
                  <>
                    {themeList
                      .filter((e) => !unpinnedThemes.includes(e.id))
                      .map((x) => (
                        <ThemeToggle data={x} collapsible />
                      ))}
                  </>
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
              </Focusable>
            </>
          ) : (
            <span>You have no themes currently, click on "Download Themes" to download some!</span>
          )}
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
            title: !!apiMeData ? "Account" : "Log In",
            content: <LogInPage />,
            id: "LogInPage",
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

  python.resolve(python.getThemes(), (allThemes: Theme[]) => {
    python.resolve(python.storeRead("unpinnedThemes"), (unpinnedJsonStr: string) => {
      const unpinnedThemes: string[] = unpinnedJsonStr ? JSON.parse(unpinnedJsonStr) : [];
      const allIds = allThemes.map((e) => e.id);

      // If a theme is in the unpinned store but no longer exists, remove it from the unpinned store
      let unpinnedClone = [...unpinnedThemes];
      unpinnedThemes.forEach((e) => {
        if (!allIds.includes(e)) {
          console.log(e, " manually deleted");
          unpinnedClone = unpinnedClone.filter((id) => id !== e);
        }
      });

      state.setGlobalState("unpinnedThemes", unpinnedClone);
      if (JSON.stringify(unpinnedClone) !== unpinnedJsonStr) {
        console.log("updating store");
        python.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));
      }
    });
  });

  python.resolve(python.storeRead("shortToken"), (token: string) => {
    if (token) {
      state.setGlobalState("apiShortToken", token);
    }
  });

  serverApi.routerHook.addRoute("/cssloader/theme-manager", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ThemeManagerRouter />
    </CssLoaderContextProvider>
  ));

  serverApi.routerHook.addRoute("/cssloader/expanded-view", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ExpandedViewPage />
    </CssLoaderContextProvider>
  ));

  return {
    // CustomTitleView: <TitleView />,
    title: <div>CSSLoader</div>,
    alwaysRender: true,
    content: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <Content stateClass={state} />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
  };
});
