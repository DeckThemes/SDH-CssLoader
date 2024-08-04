import { getCSSLoaderState } from "@/backend";
import { FullCSSThemeInfo } from "@/types";
import { Navigation } from "@decky/ui";
import { createStore, useStore } from "zustand";

interface IExpandedViewStoreValues {
  loaded: boolean;
  error: string | null;
  openedId: string | null;
  data: FullCSSThemeInfo;
}

interface IExpandedViewStoreActions {
  openTheme: (themeId: string) => Promise<void>;
  downloadTheme: () => Promise<void>;
  close: () => void;
}

export interface IExpandedViewStore extends IExpandedViewStoreValues, IExpandedViewStoreActions {}

const expandedViewStore = createStore<IExpandedViewStore>((set, get) => {
  return {
    loaded: false,
    openedId: null,
    data: {} as FullCSSThemeInfo,
    error: null,
    openTheme: async (themeId) => {
      set({ loaded: false, error: null, openedId: themeId });
      Navigation.Navigate("/cssloader/expanded-view");
      const { apiFetch } = getCSSLoaderState();
      try {
        const response = await apiFetch<FullCSSThemeInfo>(`/themes/${themeId}`);
        if (response) {
          set({ data: response, loaded: true });
          return;
        }
        throw new Error("No response returned");
      } catch (error) {
        set({ error: "Error fetching theme!", loaded: true });
      }
    },
    downloadTheme: async () => {
      // const { apiFetch } = getCSSLoaderState();
      // try {
      //   await apiFetch(`/theme/${get().data.id}/download`, {}, true);
      // } catch (error) {
      //   set({ error: "Error downloading theme!" });
      // }
    },
    close: () => {
      set({ loaded: false, openedId: null, data: {} as FullCSSThemeInfo, error: null });
      Navigation.NavigateBack();
    },
  };
});

const useExpandedViewState = (fn: (state: IExpandedViewStore) => any) =>
  useStore(expandedViewStore, fn);

export const useExpandedViewValue = <T extends keyof IExpandedViewStoreValues>(
  key: T
): IExpandedViewStore[T] => useExpandedViewState((state) => state[key]);

export const useExpandedViewAction = <T extends keyof IExpandedViewStoreActions>(
  key: T
): IExpandedViewStore[T] => useExpandedViewState((state) => state[key]);
