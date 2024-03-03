import { refreshToken } from "../../api";
import { toast } from "../../python";
import { globalState, server } from "../pythonRoot";

// function createHeadersObj(authToken: string | undefined, request: RequestInit | undefined) {
//   const headers = new Headers();
//   if (request && request.headers) {
//     for (const [key, value] of Object.entries(request.headers)) {
//       headers.append(key, value);
//     }
//   }
//   if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

//   return headers;
// }

function createHeadersObj(authToken: string | undefined, request: RequestInit | undefined) {
  let headers = {};
  if (request && request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      headers[key] = value;
    }
  }
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  return headers;
}
export async function genericApiFetch(
  fetchPath: string,
  request: RequestInit | undefined = undefined,
  options: {
    requiresAuth?: boolean;
    onError?: () => void;
    customAuthToken?: string;
    failSilently?: boolean;
  } = {
    requiresAuth: false,
    customAuthToken: undefined,
    onError: () => {},
    failSilently: false,
  }
) {
  const {
    requiresAuth = false,
    customAuthToken = undefined,
    onError = () => {},
    failSilently = false,
  } = options;

  const { apiUrl } = globalState!.getPublicState();
  function doTheFetching(authToken: string | undefined = undefined) {
    const headers = createHeadersObj(authToken, request);

    return server!
      .fetchNoCors<Response>(`${apiUrl}${fetchPath}`, {
        method: "GET",
        // If a  custom method is specified in request it will overwrite
        ...request,
        headers: headers,
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
        throw new Error(`Res not OK!, code ${res.status} - ${res.body}`);
      })
      .then((json) => {
        if (json) {
          return json;
        }
        throw new Error(`No json returned!`);
      })
      .catch((err) => {
        if (!failSilently) {
          console.error(`Error fetching ${fetchPath}`, err);
        }
        onError();
      });
  }
  if (requiresAuth) {
    if (customAuthToken) {
      return doTheFetching(customAuthToken);
    }
    return refreshToken(onError).then((token) => {
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
