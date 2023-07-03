// Code from https://github.com/NGnius/PowerTools/blob/dev/src/python.ts
import { ServerAPI } from "decky-frontend-lib";
import { CssLoaderState } from "./state";
import { Theme } from "./ThemeTypes";

var server: ServerAPI | undefined = undefined;
var globalState: CssLoaderState | undefined = undefined;

export function setServer(s: ServerAPI) {
  server = s;
}
export function setStateClass(s: CssLoaderState): void {
  globalState = s;
}

export async function openFilePicker(path: string) {
  return await server!.openFilePicker(path, true);
}

export function fetchThemePath() {
  return server!.callPluginMethod("fetch_theme_path", {});
}

export function resolve(promise: Promise<any>, setter: any) {
  (async function () {
    let data = await promise;
    if (data.success) {
      console.debug("Got resolved", data, "promise", promise);
      setter(data.result);
    } else {
      console.warn("Resolve failed:", data, "promise", promise);
    }
  })();
}

export function execute(promise: Promise<any>) {
  (async function () {
    let data = await promise;
    if (data.success) {
      console.debug("Got executed", data, "promise", promise);
    } else {
      console.warn("Execute failed:", data, "promise", promise);
    }
  })();
}

export function getInstalledThemes(): Promise<void> {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  return server!.callPluginMethod<{}, Theme[]>("get_themes", {}).then((data) => {
    if (data.success) {
      setGlobalState("localThemeList", data.result);
    }
    return;
  });
}

export function reloadBackend(): Promise<void> {
  return server!.callPluginMethod("reset", {}).then(() => {
    getInstalledThemes();
  });
}

export function getThemes(): Promise<any> {
  return server!.callPluginMethod<{}, Theme[]>("get_themes", {});
}

export function setThemeState(
  name: string,
  state: boolean,
  set_deps?: boolean,
  set_deps_value?: boolean
): Promise<any> {
  return server!.callPluginMethod("set_theme_state", {
    name: name,
    state: state,
    set_deps: set_deps ?? true,
    set_deps_value: set_deps_value ?? true,
  });
}

export function setPatchOfTheme(themeName: string, patchName: string, value: string): Promise<any> {
  return server!.callPluginMethod("set_patch_of_theme", {
    themeName: themeName,
    patchName: patchName,
    value: value,
  });
}

export function setComponentOfThemePatch(
  themeName: string,
  patchName: string,
  componentName: string,
  value: string
): Promise<any> {
  return server!.callPluginMethod("set_component_of_theme_patch", {
    themeName: themeName,
    patchName: patchName,
    componentName: componentName,
    value: value,
  });
}

export function toast(title: string, message: string) {
  // This is a weirdo self-invoking function, but it works.
  return (() => {
    try {
      return server?.toaster.toast({
        title: title,
        body: message,
        duration: 8000,
      });
    } catch (e) {
      console.log("CSSLoader Toaster Error", e);
    }
  })();
}

export function downloadThemeFromUrl(themeId: string): Promise<any> {
  const { apiUrl } = globalState!.getPublicState();
  return server!.callPluginMethod("download_theme_from_url", { id: themeId, url: apiUrl });
}

export function deleteTheme(themeName: string): Promise<any> {
  return server!.callPluginMethod("delete_theme", { themeName: themeName });
}

export function storeRead(key: string) {
  return server!.callPluginMethod("store_read", { key: key });
}

export function storeWrite(key: string, value: string) {
  return server!.callPluginMethod("store_write", { key: key, val: value });
}

export function enableServer() {
  return server!.callPluginMethod("enable_server", {});
}
export function getServerState() {
  return server!.callPluginMethod<{}, boolean>("get_server_state", {});
}

export function getBackendVersion(): Promise<any> {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  return server!.callPluginMethod<{}, Theme[]>("get_backend_version", {}).then((data) => {
    if (data.success) {
      setGlobalState("backendVersion", data.result);
    }
    return;
  });
}

export function dummyFunction(): Promise<any> {
  return server!.callPluginMethod("dummy_function", {});
}

export function genericGET(fetchUrl: string, authToken?: string | undefined) {
  return server!
    .fetchNoCors<Response>(`${fetchUrl}`, {
      method: "GET",
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : {},
    })
    .then((deckyRes) => {
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      if (res.status >= 200 && res.status <= 300 && res.body) {
        // @ts-ignore
        return JSON.parse(res.body || "");
      }
      throw new Error(`Res not OK!, code ${res.status}`);
    })
    .then((json) => {
      if (json) {
        return json;
      }
      throw new Error(`No json returned!`);
    })
    .catch((err) => {
      console.error(`Error fetching ${fetchUrl}`, err);
    });
}

export function unpinTheme(id: string) {
  const { unpinnedThemes } = globalState!.getPublicState();
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  const newArr = [...unpinnedThemes, id];
  setGlobalState("unpinnedThemes", newArr);
  return storeWrite("unpinnedThemes", JSON.stringify(newArr));
}

export function pinTheme(id: string) {
  const { unpinnedThemes } = globalState!.getPublicState();
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  const newArr = unpinnedThemes.filter((e) => e !== id);
  setGlobalState("unpinnedThemes", newArr);
  return storeWrite("unpinnedThemes", JSON.stringify(newArr));
}

export function generatePreset(name: string) {
  return server!.callPluginMethod("generate_preset_theme", { name: name });
}
