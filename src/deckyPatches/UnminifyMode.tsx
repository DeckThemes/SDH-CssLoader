import { classHashMap, initializeClassHashMap } from "./ClassHashMap";
import { getRootElements } from "./SteamTabElementsFinder";

export function unminifyElement(element: Element) {
  if (element.classList.length === 0) return;

  const classList = Array.from(element.classList);
  const unminifiedClassList = classList.map((c) => classHashMap.get(c) || c);
  element.setAttribute("unminified-class", unminifiedClassList.join(" "));
}

export function recursivelyUnminifyElement(element: Element) {
  unminifyElement(element);
  Array.from(element.children).forEach(recursivelyUnminifyElement);
}

export function initialUnminification(rootElement: any) {
  const allElements = rootElement.ownerDocument.all as HTMLAllCollection;
  Array.from(allElements).forEach(unminifyElement);
}

var mutationObservers: MutationObserver[] = [];

export function disconnectMutationObservers() {
  mutationObservers.forEach((observer) => observer.disconnect());
  mutationObservers = [];
}

export function mutationObserverCallback(mutations: MutationRecord[]) {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        recursivelyUnminifyElement(node as Element);
      });
    }
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      unminifyElement(mutation.target as HTMLElement);
    }
  });
}

export function setUpMutationObserver(rootElement: any) {
  const mutationObserver = new MutationObserver(mutationObserverCallback);
  mutationObserver.observe(rootElement.ownerDocument.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  });
  mutationObservers.push(mutationObserver);
}

export function enableUnminifyMode() {
  if (mutationObservers.length > 0) disconnectMutationObservers();
  initializeClassHashMap();
  const roots = getRootElements();
  roots.forEach(initialUnminification);
  roots.forEach(setUpMutationObserver);
}

export function disableUnminifyMode() {
  disconnectMutationObservers();
}
