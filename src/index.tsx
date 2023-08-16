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
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import { PresetSelectionDropdown, QAMThemeToggleList, TitleView } from "./components";
import { ExpandedViewPage } from "./theme-manager/ExpandedView";
import { Flags, Theme } from "./ThemeTypes";
import { dummyFunction, getInstalledThemes, reloadBackend } from "./python";
import { bulkThemeUpdateCheck } from "./logic/bulkThemeUpdateCheck";
import { disableNavPatch, enableNavPatch } from "./deckyPatches/NavPatch";

function Content() {
  const { localThemeList, setGlobalState } = useCssLoaderState();

  const [dummyFuncResult, setDummyResult] = useState<boolean>(false);

  function dummyFuncTest() {
    dummyFunction().then((res) => {
      if (res.success) {
        setDummyResult(res.result);
        return;
      }
      setDummyResult(false);
    });
  }

  function reload() {
    reloadBackend();
    dummyFuncTest();
    bulkThemeUpdateCheck().then((data) => [setGlobalState("updateStatuses", data)]);
  }

  // This will likely only run on a user's first run
  // todo: potentially there's a way to make this run without an expensive stringify useEffect running always
  // however, I want to make sure that someone can't delete the folder "Default Profile", as that would be bad
  useEffect(() => {
    // This happens before state prefilled
    if (localThemeList.length === 0) return;
  }, [JSON.stringify(localThemeList.filter((e) => e.flags.includes(Flags.isPreset)))]);

  useEffect(() => {
    setGlobalState(
      "selectedPreset",
      localThemeList.find((e) => e.flags.includes(Flags.isPreset) && e.enabled)
    );
  }, [localThemeList]);

  useEffect(() => {
    dummyFuncTest();
    getInstalledThemes();
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
          <PresetSelectionDropdown />
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

  python.resolve(python.getThemes(), async (allThemes: Theme[]) => {
    // Set selectedPreset
    state.setGlobalState(
      "selectedPreset",
      allThemes.find((e) => e.flags.includes(Flags.isPreset) && e.enabled)
    );

    // Check for updates, and schedule a check 24 hours from now
    bulkThemeUpdateCheck(allThemes).then((data) => {
      state.setGlobalState("updateStatuses", data);
    });
    python.scheduleCheckForUpdates();

    // If a user has magically deleted a theme in the unpinnedList and the store wasn't updated, this fixes that
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

  // Api Token
  python.resolve(python.storeRead("shortToken"), (token: string) => {
    if (token) {
      state.setGlobalState("apiShortToken", token);
    }
  });

  // Nav Patch
  python.resolve(python.storeRead("enableNavPatch"), (value: string) => {
    if (value === "true") {
      enableNavPatch();
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
    // titleView: <TitleView />,
    title: <div>CSSLoader</div>,
    alwaysRender: true,
    content: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <Content />
      </CssLoaderContextProvider>
    ),
    icon: <RiPaintFill />,
    onDismount: () => {
      const { updateCheckTimeout } = state.getPublicState();
      if (updateCheckTimeout) clearTimeout(updateCheckTimeout);
      disableNavPatch();
    },
  };
});
