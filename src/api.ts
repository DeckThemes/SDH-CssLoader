import { ServerAPI } from "decky-frontend-lib";
import { CssLoaderState } from "./state";
import { toast, storeWrite } from "./python";
import { ThemeQueryRequest, ThemeQueryResponse } from "./apiTypes";
import { generateParamStr } from "./logic";

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
          genericGET(`/auth/me`, true, data.token).then((meData) => {
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
export function refreshToken(): Promise<string | undefined> {
  const { apiFullToken, apiTokenExpireDate, apiUrl } = globalState!.getPublicState();
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  if (!apiFullToken) {
    return Promise.resolve(undefined);
  }
  if (apiTokenExpireDate === undefined) {
    return Promise.resolve(apiFullToken);
  }
  if (new Date().valueOf() < apiTokenExpireDate) {
    return Promise.resolve(apiFullToken);
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

export async function genericGET(
  fetchPath: string,
  requiresAuth: boolean = false,
  customAuthToken: string | undefined = undefined
) {
  const { apiUrl } = globalState!.getPublicState();
  function doTheFetching(authToken: string | undefined = undefined) {
    return server!
      .fetchNoCors<Response>(`${apiUrl}${fetchPath}`, {
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
        console.error(`Error fetching ${fetchPath}`, err);
      });
  }
  if (requiresAuth) {
    if (customAuthToken) {
      return doTheFetching(customAuthToken);
    }
    return refreshToken().then((token) => {
      if (token) {
        return doTheFetching(token);
      } else {
        toast("Error Refreshing Token!", "");
        return;
      }
    });
  } else {
    return doTheFetching();
  }
}

export function getThemes(
  searchOpts: ThemeQueryRequest,
  apiPath: string,
  globalStateVarName: string,
  setSnapIndex: (i: number) => void,
  requiresAuth: boolean = false
) {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  const queryStr = generateParamStr(
    searchOpts.filters !== "All" ? searchOpts : { ...searchOpts, filters: "" },
    "CSS."
  );
  genericGET(`${apiPath}${queryStr}`, requiresAuth).then((data: ThemeQueryResponse) => {
    if (data.total > 0) {
      setGlobalState(globalStateVarName, data);
    } else {
      setGlobalState(globalStateVarName, { total: 0, items: [] });
    }
    setSnapIndex(-1);
  });
}
