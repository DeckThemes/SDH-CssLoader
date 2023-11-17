import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  DialogButton,
  Focusable,
  Navigation,
} from "decky-frontend-lib";
import { useEffect, useState, FC } from "react";
import * as python from "./python";
import * as api from "./api";
import { RiPaintFill } from "react-icons/ri";

import { ThemeManagerRouter } from "./pages/theme-manager";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "./state";
import { MOTDDisplay, PresetSelectionDropdown, QAMThemeToggleList, TitleView } from "./components";
import { ExpandedViewPage } from "./pages/theme-manager/ExpandedView";
import { Flags, Theme } from "./ThemeTypes";
import { dummyFunction, getInstalledThemes, reloadBackend } from "./python";
import { bulkThemeUpdateCheck } from "./logic/bulkThemeUpdateCheck";
import { disableNavPatch, enableNavPatch } from "./deckyPatches/NavPatch";
import { FaCog, FaStore } from "react-icons/fa";
import { SettingsPageRouter } from "./pages/settings/SettingsPageRouter";

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
    bulkThemeUpdateCheck().then((data) => setGlobalState("updateStatuses", data));
  }

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
    <>
      <MOTDDisplay />
      <PanelSection title="Themes">
        {dummyFuncResult ? (
          <>
            <style>
              {`
              .CSSLoader_QAMTab_NavButton {
                height: 2em !important;
                width: 1.5em !important;
                min-width: 1.5em !important;
                position: relative !important;
                border-radius: 10% !important;
              }
              .CSSLoader_QAMTab_NavContainer {
                display: flex;
                align-items: center;
                justify-content: start;
                gap: 0.5em;
                padding: 0.5em 0 !important;
              }
              .CSSLoader_QAMTab_NavButtonIcon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%); 
              }
            `}
            </style>
            {localThemeList.length > 0 && <PresetSelectionDropdown />}
            <QAMThemeToggleList />
          </>
        ) : (
          <PanelSectionRow>
            <span>
              CssLoader failed to initialize, try reloading, and if that doesn't work, try
              restarting your deck.
            </span>
          </PanelSectionRow>
        )}

        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => reload()}>
            Refresh
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
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

  serverApi.routerHook.addRoute("/cssloader/settings", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <SettingsPageRouter />
    </CssLoaderContextProvider>
  ));

  serverApi.routerHook.addRoute("/cssloader/expanded-view", () => (
    <CssLoaderContextProvider cssLoaderStateClass={state}>
      <ExpandedViewPage />
    </CssLoaderContextProvider>
  ));

  return {
    titleView: (
      <CssLoaderContextProvider cssLoaderStateClass={state}>
        <TitleView />
      </CssLoaderContextProvider>
    ),
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
