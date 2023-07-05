import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  Router,
} from "decky-frontend-lib";
import { useEffect, useState, FC } from "react";
import * as python from "./python";
import * as api from "./api";
import { RiPaintFill } from "react-icons/ri";

import { ThemeManagerRouter } from "./theme-manager";
import { CssLoaderContextProvider, CssLoaderState } from "./state";
import { QAMThemeToggleList, TitleView } from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";
import { Theme } from "./ThemeTypes";

function Content() {
  const [dummyFuncResult, setDummyResult] = useState<boolean>(false);

  function dummyFuncTest() {
    python.resolve(python.dummyFunction(), setDummyResult);
  }

  function reload() {
    python.reloadBackend();
    dummyFuncTest();
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
                Router.Navigate("/cssloader/theme-manager");
              }}
            >
              Download Themes
            </ButtonItem>
          </PanelSectionRow>
          <QAMThemeToggleList />
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
}

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
          unpinnedClone = unpinnedClone.filter((id) => id !== e);
        }
      });

      state.setGlobalState("unpinnedThemes", unpinnedClone);
      if (JSON.stringify(unpinnedClone) !== unpinnedJsonStr) {
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
    titleView: <TitleView />,
    title: <div>CSSLoader</div>,
    alwaysRender: true,
    content: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <Content />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
  };
});
