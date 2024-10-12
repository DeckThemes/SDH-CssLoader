import {
  Flags,
  FullAccountData,
  MinimalCSSThemeInfo,
  Motd,
  Theme,
  ThemeError,
  UpdateStatus,
} from "../../types";
import { createStore } from "zustand";
import type { Backend } from "../services";
import { FetchError } from "../errors";

const apiUrl = "https://api.deckthemes.com";

export interface CSSLoaderStateValues {
  apiUrl: string;
  // Account Data
  apiShortToken: string;
  apiFullToken: string;
  apiMeData: FullAccountData | undefined;
  apiTokenExpireDate: number | undefined;

  // Theme Metadata
  updateStatuses: UpdateStatus[];
  nextUpdateCheckTime: number; // Unix timestamp;
  updateCheckTimeout: NodeJS.Timeout | undefined;
  unpinnedThemes: string[];
  isWorking: boolean;
  selectedPreset: Theme | undefined;
  themeRootPath: string;
  themeErrors: ThemeError[];
  themes: Theme[];

  // Plugin Settings
  dummyFunctionResult: boolean;
  backendVersion: number;
  motd: Motd | undefined;
  hiddenMotdId: string;
}

export interface CSSLoaderStateActions {
  initializeStore: () => Promise<void>;
  deactivate: () => void;
  toast: (message: string) => void;
  reloadPlugin: () => Promise<void>;
  reloadThemes: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
  apiFetch: <Return>(
    url: string,
    request?: RequestInit,
    requiresAuth?: boolean | string
  ) => Promise<Return>;
  getThemes: () => Promise<void>;
  changePreset: (presetName: string) => Promise<void>;
  testBackend: () => Promise<void>;
  bulkThemeUpdateCheck: () => Promise<void>;
  scheduleBulkThemeUpdateCheck: () => void;
  getMotd: () => Promise<void>;
  hideMotd: () => Promise<void>;
  regenerateCurrentPreset: () => Promise<void>;
  setPatchValue: (themeName: string, patchName: string, value: string) => Promise<void>;
  setComponentValue: (
    themeName: string,
    patchName: string,
    componentName: string,
    value: string
  ) => Promise<void>;
  installTheme: (themeId: string) => Promise<void>;
  toggleTheme: (
    theme: Theme,
    value: boolean,
    enableDeps?: boolean,
    enableDepValues?: boolean
  ) => Promise<void>;
}

export interface ICSSLoaderState extends CSSLoaderStateValues, CSSLoaderStateActions {}

export const createCSSLoaderStore = (backend: Backend) =>
  createStore<ICSSLoaderState>((set, get) => {
    async function apiFetch<Return>(
      fetchPath: string,
      request?: RequestInit,
      // Can be a boolean (to automatically fetch token), or a string (to use a custom token)
      requiresAuth?: boolean | string
    ) {
      try {
        const { refreshToken } = get();
        let authToken = undefined;
        if (requiresAuth) {
          authToken = typeof requiresAuth === "string" ? requiresAuth : await refreshToken();
        }
        return await backend.fetch<Return>(`${apiUrl}${fetchPath}`, {
          method: "GET",
          ...request,
          headers: {
            ...(request?.headers || {}),
            Authorization: `Bearer ${authToken}`,
          },
        });
      } catch (error) {
        if (error instanceof FetchError) {
          throw error;
        }
        throw new FetchError("Fetch Failed", fetchPath, "Unknown Error");
      }
    }

    return {
      apiUrl: apiUrl,
      // Account Data
      apiShortToken: "",
      apiFullToken: "",
      apiMeData: undefined,
      apiTokenExpireDate: undefined,

      // Theme Metadata
      updateStatuses: [],
      nextUpdateCheckTime: 0,
      updateCheckTimeout: undefined,
      isWorking: false,
      unpinnedThemes: [],
      selectedPreset: undefined,
      themeRootPath: "",
      themeErrors: [],
      themes: [],

      // Plugin Settings
      dummyFunctionResult: false,
      backendVersion: 9,
      motd: undefined,
      hiddenMotdId: "",
      unminifyModeOn: false,
      navPatchInstance: undefined,

      initializeStore: async () => {
        try {
          const dummyFunctionResult = await backend.dummyFunction();
          set({ dummyFunctionResult });
          // If the backend doesn't work, no point in running the rest
          if (!dummyFunctionResult) return;

          const backendVersion = await backend.getBackendVersion();
          set({ backendVersion });

          const themes = (await backend.getThemes()) ?? [];
          console.log("THEMES", themes.length, themes.filter((e) => e.enabled).length);
          set({
            themes,
            selectedPreset: themes.find((e) => e.flags.includes(Flags.isPreset) && e.enabled),
          });

          const themePath = await backend.fetchThemePath();
          set({ themeRootPath: themePath });

          const unpinnedThemesStr = await backend.storeRead("unpinnedThemes");
          const unpinnedThemes: string[] = unpinnedThemesStr ? JSON.parse(unpinnedThemesStr) : [];
          const allThemeIds = themes.map((e) => e.id);
          // If a theme is in the unpinned store but no longer exists, remove it from the unpinned store
          let unpinnedClone = [...unpinnedThemes];
          unpinnedThemes.forEach((e) => {
            if (!allThemeIds.includes(e)) {
              unpinnedClone = unpinnedClone.filter((id) => id !== e);
            }
          });
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));

          const shortToken = await backend.storeRead("shortToken");
          set({ apiShortToken: shortToken ?? "" });
          const hiddenMotd = await backend.storeRead("hiddenMotd");
          set({ hiddenMotdId: hiddenMotd ?? "" });

          const { bulkThemeUpdateCheck, scheduleBulkThemeUpdateCheck } = get();
          await bulkThemeUpdateCheck();
          scheduleBulkThemeUpdateCheck();
        } catch (error) {
          console.log("Error During Initialzation", error);
        }
      },
      deactivate: () => {
        const { updateCheckTimeout } = get();
        if (updateCheckTimeout) clearTimeout(updateCheckTimeout);
      },
      toast: (message: string) => {
        backend.toast("CSS Loader", message);
      },
      reloadPlugin: async () => {
        set({ isWorking: true });
        try {
          const { reloadThemes, initializeStore, bulkThemeUpdateCheck, dummyFunctionResult } =
            get();

          // If the dummy func result is false, the plugin never initialized properly anyway, so we should just re-initialize the whole thing.
          if (dummyFunctionResult === false) {
            await initializeStore();
          } else {
            // Otherwise, we can just reload the necessary stuff
            const dummyFunctionResult = await backend.dummyFunction();
            set({ dummyFunctionResult });
            await reloadThemes();
            await bulkThemeUpdateCheck();
          }
        } catch (error) {}
        set({ isWorking: false });
      },
      reloadThemes: async () => {
        try {
          await backend.reset();
          await get().getThemes();
        } catch (error) {
          console.error("Error Reloading Themes", error);
        }
      },
      refreshToken: async (): Promise<string | undefined> => {
        const { apiFullToken, apiTokenExpireDate } = get();
        if (!apiFullToken) {
          return undefined;
        }
        if (apiTokenExpireDate === undefined || new Date().valueOf() < apiTokenExpireDate) {
          return apiFullToken;
        }
        try {
          const json = await backend.fetch<{ token: string }>(`${apiUrl}/auth/refresh_token`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiFullToken}`,
            },
          });

          if (!json.token) {
            throw new FetchError(
              "Token Refresh Failed",
              `${apiUrl}/auth/refresh_token`,
              "No Token in Response"
            );
          }
          set({
            apiFullToken: json.token,
            apiTokenExpireDate: new Date().valueOf() + 1000 * 10 * 60,
          });
          return json.token;
        } catch (error) {
          throw error;
        }
      },
      apiFetch: apiFetch,
      getThemes: async () => {
        try {
          const { fails: themeErrors } = await backend.getThemeErrors();
          set({ themeErrors });
          const themes = await backend.getThemes();
          set({ themes });
        } catch (error) {}
      },
      changePreset: async (presetName: string) => {
        try {
          const { selectedPreset, themes } = get();

          if (selectedPreset) {
            // If you already have a preset enabled, disabling the preset disables all of it's dependencies with it.
            await backend.setThemeState(selectedPreset.name, false);
          } else {
            // If you don't have a preset, you need to disable all currently enabled themes and THEN enable the preset
            await Promise.all(
              themes.filter((e) => e.enabled).map((e) => backend.setThemeState(e.name, false))
            );
          }
          // Actually enabling the preset itself
          if (presetName !== "None") {
            await backend.setThemeState(presetName, true);
          }
          await get().getThemes();
        } catch (error) {}
      },
      testBackend: async () => {
        try {
          const dummyFunctionResult = await backend.dummyFunction();
          set({ dummyFunctionResult });
        } catch (error) {
          set({ dummyFunctionResult: false });
        }
      },
      bulkThemeUpdateCheck: async () => {
        const { themes } = get();

        async function fetchThemeIDS(idsToQuery: string[]): Promise<MinimalCSSThemeInfo[]> {
          const queryStr = "?ids=" + idsToQuery.join(".");
          try {
            console.log("FETCHTHEMEIDS STRING", themes.length);
            const value = await apiFetch<MinimalCSSThemeInfo[]>(`/themes/ids${queryStr}`);
            console.log("VALUE", value);
            if (value) return value;
          } catch {}
          return [];
        }

        let idsToQuery: string[] = themes.map((e) => e.id);
        if (idsToQuery.length === 0) set({ updateStatuses: [] });

        const themeArr = await fetchThemeIDS(idsToQuery);

        if (themeArr.length === 0) set({ updateStatuses: [] });

        const updateStatusArr: UpdateStatus[] = themes.map((localEntry) => {
          const remoteEntry = themeArr.find(
            (remote) => remote.id === localEntry.id || remote.name === localEntry.id
          );
          if (!remoteEntry) {
            return [localEntry.id, "local", false];
          }
          if (remoteEntry.version === localEntry.version) {
            return [localEntry.id, "installed", remoteEntry];
          }
          return [localEntry.id, "outdated", remoteEntry];
        });
        set({ updateStatuses: updateStatusArr });
      },
      scheduleBulkThemeUpdateCheck: () => {
        function recursiveCheck() {
          const timeout = setTimeout(async () => {
            // Putting this in the function as im not sure the value would update otherwise
            const { nextUpdateCheckTime } = get();
            if (!(new Date().valueOf() > nextUpdateCheckTime)) {
              recursiveCheck();
              return;
            }
            // After testing, it appears that, if there is no wifi, bulkThemeUpdateCheck returns an empty array, this is okay, the try catch is just for extra safety
            try {
              const { bulkThemeUpdateCheck } = get();
              await bulkThemeUpdateCheck();

              set({ nextUpdateCheckTime: new Date().valueOf() + 24 * 60 * 60 * 1000 });
            } catch (err) {
              console.log("Error Checking For Theme Updates", err);
            }
            recursiveCheck();
          }, 5 * 60 * 1000);
          set({ updateCheckTimeout: timeout });
        }
        set({ nextUpdateCheckTime: new Date().valueOf() + 24 * 60 * 60 * 1000 });
        recursiveCheck();
      },
      getMotd: async () => {
        try {
          const value = await apiFetch<Motd>("/motd");
          if (value) {
            set({ motd: value });
          }
        } catch (error) {}
      },
      hideMotd: async () => {
        try {
          const { motd } = get();
          if (!motd) return;
          await backend.storeWrite("hiddenMotd", motd.id);
          set({ hiddenMotdId: motd.id });
        } catch (error) {}
      },
      regenerateCurrentPreset: async () => {
        try {
          const { selectedPreset, themes } = get();
          if (!selectedPreset) return;
          await backend.generatePresetThemeFromThemeNames(
            selectedPreset.name,
            // This will handle if you just toggles/un-toggled a theme, as well as if you changed a patch/component
            themes.filter((e) => e.enabled && !e.flags.includes(Flags.isPreset)).map((e) => e.name)
          );
        } catch (error) {}
      },
      setPatchValue: async (themeName: string, patchName: string, value: string) => {
        try {
          await backend.setPatchOfTheme(themeName, patchName, value);
          const { selectedPreset, regenerateCurrentPreset } = get();
          if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
            await regenerateCurrentPreset();
          }
        } catch (error) {}
      },
      setComponentValue: async (
        themeName: string,
        patchName: string,
        componentName: string,
        value: string
      ) => {
        try {
          await backend.setComponentOfThemePatch(themeName, patchName, componentName, value);
          const { selectedPreset, regenerateCurrentPreset, getThemes } = get();
          if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
            await regenerateCurrentPreset();
          }
          // TODO: POTENTIALLY NOT NEEDED
          await getThemes();
        } catch (error) {}
      },
      installTheme: async (themeId: string) => {
        set({ isWorking: true });
        try {
          await backend.downloadThemeFromUrl(themeId, apiUrl);
          const { updateStatuses, reloadThemes } = get();
          await reloadThemes();
          const updateStatusesClone = updateStatuses.filter((e) => e[0] !== themeId);
          updateStatusesClone.push([themeId, "installed", false]);
          set({ updateStatuses: updateStatusesClone });
        } catch (error) {}
        set({ isWorking: false });
      },
      toggleTheme: async (
        theme: Theme,
        value: boolean,
        enableDeps?: boolean,
        enableDepValues?: boolean
      ) => {
        try {
          await backend.setThemeState(theme.name, value, enableDeps, enableDepValues);
          await get().getThemes();

          if (!enableDeps && theme.dependencies.length > 0) {
            if (value) {
              backend.toast(
                `${theme.display_name} enabled other themes`,
                `${theme.dependencies.length} other theme${
                  theme.dependencies.length === 1 ? " is" : "s are"
                } required by ${theme.display_name}`
              );
            } else if (!theme.flags.includes(Flags.dontDisableDeps)) {
              backend.toast(
                `${theme.display_name} disabled other themes`,
                `${theme.dependencies.length} other theme${
                  theme.dependencies.length === 1 ? " was" : "s were"
                } originally enabled by ${theme.display_name}`
              );
            }
          }
          const { selectedPreset } = get();
          if (selectedPreset) {
            await get().regenerateCurrentPreset();
            await get().getThemes();
          }
        } catch (error) {}
      },
    };
  });
