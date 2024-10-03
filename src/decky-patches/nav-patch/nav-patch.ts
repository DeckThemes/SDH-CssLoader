import { Patch, findModuleExport, replacePatch } from "@decky/ui";

export const NavController = findModuleExport(
  (e) => e?.prototype?.FindNextFocusableChildInDirection
);
export function enableNavPatch(): Patch {
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
        console.log(e.m_element);
        if (e && window.getComputedStyle(e.m_element).display !== "none") return e;
      }
      return null;
    }
  );
  return patch;
}

export function disableNavPatch(navPatchInstance: Patch | undefined) {
  if (!navPatchInstance) return;
  navPatchInstance.unpatch();
}
