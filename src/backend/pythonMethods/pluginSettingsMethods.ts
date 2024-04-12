import { storeRead, toast } from "../../python";
import { server, globalState } from "../pythonRoot";
import { booleanStoreRead, stringStoreRead } from "./storeUtils";

export function enableServer() {
  return server!.callPluginMethod("enable_server", {});
}

export async function getServerState() {
  const deckyRes = await server!.callPluginMethod<{}, boolean>("get_server_state", {});
  if (!deckyRes.success) {
    toast("Error fetching server state", deckyRes.result);
    return false;
  }
  return deckyRes.result;
}

export async function getWatchState() {
  const deckyRes = await server!.callPluginMethod<{}, boolean>("get_watch_state", {});
  if (!deckyRes.success) {
    toast("Error fetching watch state", deckyRes.result);
    return false;
  }
  return deckyRes.result;
}

export async function getBetaTranslationsState() {
  return stringStoreRead("beta_translations");
}

export function toggleWatchState(bool: boolean, onlyThisSession: boolean = false) {
  return server!.callPluginMethod<{ enable: boolean; only_this_session: boolean }, void>(
    "toggle_watch_state",
    {
      enable: bool,
      only_this_session: onlyThisSession,
    }
  );
}

// Todo: when i rewrite store interop, move this
export function setHiddenMotd(id: string) {
  return server!.callPluginMethod<{ key: string; val: string }>("store_write", {
    key: "hiddenMotd",
    val: id,
  });
}
export function getHiddenMotd() {
  return server!.callPluginMethod<{ key: string }, string>("store_read", {
    key: "hiddenMotd",
  });
}

export function fetchClassMappings() {
  return server!.callPluginMethod<{}>("fetch_class_mappings", {});
}
