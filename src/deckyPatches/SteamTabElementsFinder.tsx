import { getGamepadNavigationTrees } from "decky-frontend-lib";

export function getElementFromNavID(navID: string) {
  const all = getGamepadNavigationTrees();
  if (!all) return null;
  const tree = all?.find((e: any) => e.m_ID == navID);
  if (!tree) return null;
  return tree.Root.Element;
}
export function getSP() {
  return getElementFromNavID("root_1_");
}
export function getQAM() {
  return getElementFromNavID("QuickAccess-NA");
}
export function getMainMenu() {
  return getElementFromNavID("MainNavMenuContainer");
}
export function getRootElements() {
  return [getSP(), getQAM(), getMainMenu()].filter((e) => e);
}
