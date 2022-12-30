// Code from https://github.com/NGnius/PowerTools/blob/dev/src/python.ts
import { ServerAPI, ServerResponse } from "decky-frontend-lib";

var server: ServerAPI | undefined = undefined;

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

export function setServer(s: ServerAPI) {
  server = s;
}

export function getThemes(): Promise<any> {
  return server!.callPluginMethod("get_themes", {});
}

export function setThemeState(name: string, state: boolean): Promise<any> {
  return server!.callPluginMethod("set_theme_state", {
    name: name,
    state: state,
  });
}

export function reset(): Promise<any> {
  return server!.callPluginMethod("reset", {});
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

export function downloadThemeFromUrl(themeId: string, url: string): Promise<any> {
  return server!.callPluginMethod("download_theme_from_url", { id: themeId, url: url });
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

export function getBackendVersion(): Promise<any> {
  return server!.callPluginMethod("get_backend_version", {});
}

export function dummyFunction(): Promise<any> {
  return server!.callPluginMethod("dummy_function", {});
}

export function refreshToken(url: string, authToken: string | undefined) {
  return server!
    .fetchNoCors(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then((deckyRes) => {
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      // @ts-ignore
      if (res.status >= 200 && res.status <= 300 && res.body) {
        // @ts-ignore
        return JSON.parse(res.body || "");
      }
      // @ts-ignore
      throw new Error(`Res not OK!, code ${res.status}`);
    })
    .then((json) => {
      if (json.token) {
        return json.token;
      }
      throw new Error(`No token returned!`);
    })
    .catch((err) => {
      console.error(`Error Refreshing Token!`, err);
    });
}

export function genericGET(
  fetchUrl: string,
  authToken?: string | undefined,
  expiryDate?: Date | number | undefined
) {
  if (new Date().valueOf()) {
  }

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

export function toggleStar(themeId: string, isStarred: boolean, authToken: string, apiUrl: string) {
  return server!
    .fetchNoCors<Response>(`${apiUrl}/users/me/stars/${themeId}`, {
      method: isStarred ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then((deckyRes) => {
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      if (res.status >= 200 && res.status <= 300) {
        // @ts-ignore
        return true;
      }
      throw new Error(`Res not OK!, code ${res.status}`);
    })
    .catch((err) => {
      console.error(`Error starring theme`, err);
    });
}

export function authWithShortToken(shortToken: string, apiUrl: string) {
  return server!
    .callServerMethod("http_request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      url: `${apiUrl}/auth/authenticate_token`,
      data: JSON.stringify({ token: shortToken }),
    })
    .then((deckyRes) => {
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      // @ts-ignore
      return JSON.parse(res?.body || "");
    })
    .then((json) => {
      if (json) {
        return json;
      }
      throw new Error(`No json returned!`);
    })
    .catch((err) => {
      console.error(`Error authenticating from short token.`, err);
    });
}
