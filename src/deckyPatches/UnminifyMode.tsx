import { classMap } from "decky-frontend-lib";
import { getRootElements } from "./SteamTabElementsFinder";

const classHashMap = new Map<string, string>();

function initializeClassHashMap() {
  const withoutLocalizationClasses = classMap.filter((module) => Object.keys(module).length < 1000);

  const allClasses = withoutLocalizationClasses
    .map((module) => {
      let filteredModule = {};
      Object.entries(module).forEach(([propertyName, value]) => {
        // Filter out things that start with a number (eg: Breakpoints like 800px)
        // I have confirmed the new classes don't start with numbers
        if (isNaN(Number(value.charAt(0)))) {
          filteredModule[propertyName] = value;
        }
      });
      return filteredModule;
    })
    .filter((module) => {
      // Some modules will be empty after the filtering, remove those
      return Object.keys(module).length > 0;
    });

  allClasses.forEach((module: Record<string, string>) => {
    Object.entries(module).forEach(([propertyName, value]) => {
      classHashMap.set(value, propertyName);
    });
  });
}

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
