// This is for things that are shared across the entire Theme Browser page and all tabs.

import { createStore, useStore } from "zustand";

export type ColumnNumbers = 3 | 4 | 5;

interface ThemeBrowserSharedStoreValues {
  browserCardSize: ColumnNumbers;
  targetOverride: string | null;
}

interface ThemeBrowserSharedStoreActions {
  setBrowserCardSize: (value: ColumnNumbers) => void;
  setTargetOverride: (value: string | null) => void;
}

interface IThemeBrowserSharedStore
  extends ThemeBrowserSharedStoreValues,
    ThemeBrowserSharedStoreActions {}

const themeBrowserSharedStore = createStore<IThemeBrowserSharedStore>((set) => {
  return {
    browserCardSize: 3,
    targetOverride: "",
    setBrowserCardSize: (value: ColumnNumbers) => set({ browserCardSize: value }),
    setTargetOverride: (value: string | null) => set({ targetOverride: value }),
  };
});

export const getThemeBrowserSharedState = () => themeBrowserSharedStore.getState();

const useThemeBrowserSharedState = (fn: (state: IThemeBrowserSharedStore) => any) =>
  useStore(themeBrowserSharedStore, fn);

export const useThemeBrowserSharedValue = <T extends keyof ThemeBrowserSharedStoreValues>(
  key: T
): IThemeBrowserSharedStore[T] => useThemeBrowserSharedState((state) => state[key]);

export const useThemeBrowserSharedAction = <T extends keyof ThemeBrowserSharedStoreActions>(
  key: T
): IThemeBrowserSharedStore[T] => useThemeBrowserSharedState((state) => state[key]);
