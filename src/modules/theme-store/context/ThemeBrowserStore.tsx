import { createContext, useContext, useRef } from "react";
import { FilterQueryResponse, ThemeQueryRequest, ThemeQueryResponse } from "@/types";
import { StoreApi, createStore, useStore } from "zustand";
import { getCSSLoaderState } from "@/backend";

interface ThemeBrowserStoreValues {
  themes: ThemeQueryResponse;
  searchOpts: ThemeQueryRequest;
  prevSearchOpts: ThemeQueryRequest;
  filterOptions: FilterQueryResponse;
  indexToSnapToOnLoad: number;
}

interface ThemeBrowserStoreActions {
  initializeStore: () => Promise<void>;
  getFilters: () => Promise<void>;
  setSearchOpts: (searchOpts: ThemeQueryRequest) => void;
  refreshThemes: () => Promise<void>;
  getThemes: () => Promise<void>;
}

interface IThemeBrowserStore extends ThemeBrowserStoreValues, ThemeBrowserStoreActions {}

const ThemeBrowserStoreContext = createContext<StoreApi<IThemeBrowserStore> | null>(null);

function generateParamStr(searchOpts: ThemeQueryRequest) {
  let prependString = "BPM-CSS.-Preset";
  switch (searchOpts.filters) {
    // If it's desktop themes, remove the "BPM Only" filter in the default
    case "Desktop":
      prependString = "-Preset";
      break;
    // If it's presets, remove the preset exclusion in the default
    case "Preset":
      prependString = "BPM-CSS";
      break;
  }
  searchOpts.filters === "All" ? (searchOpts.filters = "") : (prependString += ".");
  prependString && (searchOpts.filters = prependString + searchOpts.filters);

  // @ts-expect-error
  const paramStr = new URLSearchParams(searchOpts).toString();
  return paramStr;
}

export function ThemeBrowserStoreProvider({
  children,
  filterPath,
  themePath,
  requiresAuth = false,
}: {
  children: React.ReactNode;
  filterPath: string;
  themePath: string;
  requiresAuth?: boolean;
}) {
  const storeRef = useRef<StoreApi<IThemeBrowserStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore<IThemeBrowserStore>((set, get) => ({
      themes: { total: 0, items: [] },
      searchOpts: {
        page: 1,
        perPage: 50,
        filters: "All",
        order: "Last Updated",
        search: "",
      },
      prevSearchOpts: {
        page: 1,
        perPage: 50,
        filters: "All",
        order: "Last Updated",
        search: "",
      },
      filterOptions: {
        filters: [],
        order: ["Last Updated"],
      },
      indexToSnapToOnLoad: -1,
      initializeStore: async () => {
        try {
          await get().getFilters();
        } catch (error) {}
      },
      getFilters: async () => {
        const { apiFetch } = getCSSLoaderState();
        try {
          const response = await apiFetch<FilterQueryResponse>(
            `${filterPath}?type=CSS`,
            {},
            requiresAuth
          );
          if (response.filters) {
            set({ filterOptions: response });
          }
        } catch (error) {}
      },
      setSearchOpts(searchOpts) {
        const prevSearchOpts = get().searchOpts;
        set({ searchOpts, prevSearchOpts });
      },
      refreshThemes: async () => {},
      getThemes: async () => {
        try {
          const { searchOpts } = get();

          const { apiFetch } = getCSSLoaderState();
          const response = await apiFetch<ThemeQueryResponse>(
            `${themePath}?${generateParamStr(searchOpts)}`,
            {},
            requiresAuth
          );
          if (response.items) {
            set({ themes: response, indexToSnapToOnLoad: -1 });
          }
        } catch (error) {}
      },
    }));
  }

  return (
    <ThemeBrowserStoreContext.Provider value={storeRef.current}>
      {children}
    </ThemeBrowserStoreContext.Provider>
  );
}

export const useThemeBrowserStore = <T,>(selector: (state: IThemeBrowserStore) => T) => {
  const store = useContext(ThemeBrowserStoreContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return useStore(store, selector);
};
export const useThemeBrowserStoreValue = <T extends keyof ThemeBrowserStoreValues>(
  key: T
): IThemeBrowserStore[T] => useThemeBrowserStore((state) => state[key]);

export const useThemeBrowserStoreAction = <T extends keyof ThemeBrowserStoreActions>(
  key: T
): IThemeBrowserStore[T] => useThemeBrowserStore((state) => state[key]);
