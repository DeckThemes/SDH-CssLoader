// This is for things that are shared across the entire Theme Browser page and all tabs.

import { createStore, useStore } from "zustand";

interface ThemeBrowserSharedStoreValues {
  browserCardSize: number;
}

interface ThemeBrowserSharedStoreActions {
  setBrowserCardSize: (value: number) => void;
}

interface IThemeBrowserSharedStore
  extends ThemeBrowserSharedStoreValues,
    ThemeBrowserSharedStoreActions {}

const themeBrowserSharedStore = createStore<IThemeBrowserSharedStore>((set) => {
  return {
    browserCardSize: 3,
    setBrowserCardSize: (value: number) => set({ browserCardSize: value }),
  };
});

const useThemeBrowserSharedState = (fn: (state: IThemeBrowserSharedStore) => any) =>
  useStore(themeBrowserSharedStore, fn);

export const useThemeBrowserSharedStateValue = <T extends keyof ThemeBrowserSharedStoreValues>(
  key: T
): IThemeBrowserSharedStore[T] => useThemeBrowserSharedState((state) => state[key]);

export const useThemeBrowserSharedStateAction = <T extends keyof ThemeBrowserSharedStoreActions>(
  key: T
): IThemeBrowserSharedStore[T] => useThemeBrowserSharedState((state) => state[key]);