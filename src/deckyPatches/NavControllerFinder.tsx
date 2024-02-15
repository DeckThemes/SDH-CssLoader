import { Module, findModuleChild } from "decky-frontend-lib";

export const NavController = findModuleChild((m: Module) => {
  if (typeof m !== "object") return undefined;

  // Pre Chromium-109
  if (m?.CFocusNavNode) {
    return m.CFocusNavNode;
  }

  for (let prop in m) {
    if (m[prop]?.prototype?.FindNextFocusableChildInDirection) {
      return m[prop];
    }
  }

  return undefined;
});
