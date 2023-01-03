import { ServerAPI } from "decky-frontend-lib";
import { CssLoaderState } from "./state";
import { toast, storeWrite } from "./python";

var server: ServerAPI | undefined = undefined;
var globalState: CssLoaderState | undefined = undefined;

export function setServer(s: ServerAPI): void {
  server = s;
}
export function setStateClass(s: CssLoaderState): void {
  globalState = s;
}

export function logOut(): void {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  setGlobalState("apiShortToken", "");
  setGlobalState("apiFullToken", "");
  setGlobalState("apiTokenExpireDate", undefined);
  setGlobalState("apiMeData", undefined);
  storeWrite("shortToken", "");
}

export function logInWithShortToken(shortTokenInterimValue?: string | undefined): void {
  const { apiUrl, apiShortToken } = globalState!.getPublicState();
  const shortTokenValue = shortTokenInterimValue ? shortTokenInterimValue : apiShortToken;
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  if (shortTokenValue.length === 12) {
    server!
      .callServerMethod("http_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        url: `${apiUrl}/auth/authenticate_token`,
        data: JSON.stringify({ token: shortTokenValue }),
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
      .then((data) => {
        if (data && data?.token) {
          storeWrite("shortToken", shortTokenValue);
          setGlobalState("apiShortToken", shortTokenValue);
          setGlobalState("apiFullToken", data.token);
          setGlobalState("apiTokenExpireDate", new Date().valueOf() + 1000 * 60 * 10);
          genericGET(`${apiUrl}/auth/me`, data.token).then((meData) => {
            if (meData?.username) {
              setGlobalState("apiMeData", meData);
              toast("Logged In!", `Logged in as ${meData.username}`);
            }
          });
        } else {
          toast("Error Authenticating", JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error(`Error authenticating from short token.`, err);
      });
  } else {
    toast("Invalid Token", "Token must be 12 characters long.");
  }
}

// This returns the token that is intended to be used in whatever call
export function refreshToken(): Promise<string> | string | undefined {
  const { apiFullToken, apiTokenExpireDate, apiUrl } = globalState!.getPublicState();
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  if (!apiFullToken) {
    return undefined;
  }
  if (apiTokenExpireDate === undefined) {
    return apiFullToken;
  }
  if (new Date().valueOf() < apiTokenExpireDate) {
    return apiFullToken;
  }
  return server!
    .fetchNoCors<Response>(`${apiUrl}/auth/refresh_token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiFullToken}`,
      },
    })
    .then((deckyRes) => {
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      console.log("res", res);
      if (res.status >= 200 && res.status <= 300 && res.body) {
        // @ts-ignore
        return JSON.parse(res.body || "");
      }
      throw new Error(`Res not OK!, code ${res.status}`);
    })
    .then((json) => {
      if (json.token) {
        return json.token;
      }
      throw new Error(`No token returned!`);
    })
    .then((token) => {
      setGlobalState("apiFullToken", token);
      setGlobalState("apiTokenExpireDate", new Date().valueOf() + 1000 * 10 * 60);
      return token;
    })
    .catch((err) => {
      console.error(`Error Refreshing Token!`, err);
    });
}

// This is a different function than genericGET as we don't want this to error. If one promise in a Promise.all rejects, the whole function errors, so I want to treat a 404 as a return value of "false"
// Kinda a hacky workaround, but that's the best kind
export function checkForUpdateById(themeId: string): Promise<any> {
  const { apiUrl } = globalState!.getPublicState();
  return server!
    .fetchNoCors<Response>(`${apiUrl}/themes/${themeId}`, {
      method: "GET",
    })
    .then((deckyRes) => {
      console.log("deckyRes", deckyRes);
      if (deckyRes.success) {
        return deckyRes.result;
      }
      throw new Error(`Fetch not successful!`);
    })
    .then((res) => {
      console.log("res", res);
      if (res.status >= 200 && res.status <= 300) {
        // @ts-ignore
        return JSON.parse(res.body || "");
      }
      throw new Error("Res Not OK!");
    })
    .then((body) => {
      console.log("body", body);
      if (body) {
        return body;
      }
      throw new Error("No Body");
    })
    .catch((err) => {
      return false;
    });
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
