import { server, globalState } from "../pythonRoot";

export function enableServer() {
  return server!.callPluginMethod("enable_server", {});
}
export function getServerState() {
  return server!.callPluginMethod<{}, boolean>("get_server_state", {});
}
export function getWatchState() {
  return server!.callPluginMethod<{}, boolean>("get_watch_state", {});
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
