import { replacePatch } from "decky-frontend-lib";
import { NavController } from "./NavControllerFinder";
import { globalState, toast, storeWrite } from "../python";

export function enableNavPatch(shouldToast: boolean = false) {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  const { navPatchInstance } = globalState!.getPublicState();
  // Don't patch twice
  if (navPatchInstance) return;
  const patch = replacePatch(
    NavController.prototype,
    "FindNextFocusableChildInDirection",
    function (args) {
      const e = args[0];
      const t = args[1];
      const r = args[2];
      let n = t == 1 ? 1 : -1;
      // @ts-ignore
      for (let t = e + n; t >= 0 && t < this.m_rgChildren.length; t += n) {
        // @ts-ignore
        const e = this.m_rgChildren[t].FindFocusableNode(r);
        if (e && window.getComputedStyle(e.m_element).display !== "none") return e;
      }
      return null;
    }
  );
  setGlobalState("navPatchInstance", patch);
  shouldToast && toast("CSS Loader", "Nav Patch Enabled");
  return;
}

export function disableNavPatch(shouldToast: boolean = false) {
  const setGlobalState = globalState!.setGlobalState.bind(globalState);
  const { navPatchInstance } = globalState!.getPublicState();
  // Don't unpatch something that doesn't exist
  // Probably the closest thing JS can get to null dereference
  if (!navPatchInstance) return;
  navPatchInstance.unpatch();
  setGlobalState("navPatchInstance", undefined);
  shouldToast && toast("CSS Loader", "Nav Patch Disabled");
  return;
}

export function setNavPatch(value: boolean, shouldToast: boolean = false) {
  value ? enableNavPatch(shouldToast) : disableNavPatch(shouldToast);
  storeWrite("enableNavPatch", value + "");
}
