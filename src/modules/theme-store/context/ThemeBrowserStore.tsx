import { createContext, useContext, useRef } from "react";
import { FilterQueryResponse, ThemeQueryRequest, ThemeQueryResponse } from "@/types";
import { StoreApi, createStore, useStore } from "zustand";
import { getCSSLoaderState } from "@/backend";
import { isEqual } from "lodash";

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
  const searchOptsClone = structuredClone(searchOpts);
  let prependString = "BPM-CSS.-Preset";
  if (searchOptsClone.filters.includes("Desktop")) {
    prependString = "-Preset";
  }
  if (searchOptsClone.filters.includes("Preset")) {
    prependString = "BPM-CSS";
  }
  searchOptsClone.filters === "All" ? (searchOptsClone.filters = "") : (prependString += ".");
  prependString && (searchOptsClone.filters = prependString + searchOptsClone.filters);

  // @ts-expect-error
  const paramStr = new URLSearchParams(searchOptsClone).toString();
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
          await get().getThemes();
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
        const { searchOpts: prevSearchOpts, themes, getThemes } = get();
        set({ searchOpts, prevSearchOpts });

        if (!isEqual(prevSearchOpts, searchOpts) || themes.total === 0) {
          getThemes();
        }
      },
      refreshThemes: async () => {
        const { getThemes } = get();
        await getThemes();
      },
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
