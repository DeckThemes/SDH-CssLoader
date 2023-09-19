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
