import { SingleDropdownOption } from "decky-frontend-lib";
import { createContext, FC, useContext, useEffect, useState } from "react";
import {
  AccountData,
  FilterQueryResponse,
  PartialCSSThemeInfo,
  ThemeQueryRequest,
  ThemeQueryResponse,
} from "../apiTypes";
import { localThemeEntry } from "../customTypes";
import { Theme } from "../theme";

interface PublicCssLoaderState {
  prevSearchOpts: ThemeQueryRequest;
  prevStarSearchOpts: ThemeQueryRequest;
  prevSubSearchOpts: ThemeQueryRequest;
  currentTab: string;
  apiUrl: string;
  apiShortToken: string;
  apiFullToken: string;
  apiTokenExpireDate: Date | number | undefined;
  apiMeData: AccountData | undefined;
  serverFilters: FilterQueryResponse;
  themeSearchOpts: ThemeQueryRequest;
  localThemeList: Theme[];
  browseThemeList: ThemeQueryResponse;
  selectedRepo: SingleDropdownOption;
  isInstalling: boolean;
  currentExpandedTheme: PartialCSSThemeInfo | undefined;
  browserCardSize: number;
  starredSearchOpts: ThemeQueryRequest;
  starredServerFilters: FilterQueryResponse;
  starredThemeList: ThemeQueryResponse;
  submissionSearchOpts: ThemeQueryRequest;
  submissionServerFilters: FilterQueryResponse;
  submissionThemeList: ThemeQueryResponse;
}

// The localThemeEntry interface refers to the theme data as given by the python function, the Theme class refers to a theme after it has been formatted and the generate function has been added

interface PublicCssLoaderContext extends PublicCssLoaderState {
  setGlobalState(key: string, data: any): void;
  getGlobalState(key: string): any;
}

// This class creates the getter and setter functions for all of the global state data.
export class CssLoaderState {
  private prevSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private prevStarSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private prevSubSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private currentTab: string = "ThemeBrowser";
  private apiUrl: string = "https://api.deckthemes.com";
  private apiShortToken: string = "";
  private apiFullToken: string = "";
  private apiTokenExpireDate: Date | number | undefined = undefined;
  private apiMeData: AccountData | undefined = undefined;
  private serverFilters: FilterQueryResponse = {
    filters: ["All"],
    order: ["Last Updated"],
  };
  private themeSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private localThemeList: Theme[] = [];
  private browseThemeList: ThemeQueryResponse = { total: 0, items: [] };
  private selectedRepo: SingleDropdownOption = {
    data: 1,
    label: "All",
  };
  private isInstalling: boolean = false;
  private currentExpandedTheme: PartialCSSThemeInfo | undefined = undefined;
  private browserCardSize: number = 3;
  private starredSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private starredServerFilters: FilterQueryResponse = {
    filters: ["All"],
    order: ["Last Updated"],
  };
  private starredThemeList: ThemeQueryResponse = { total: 0, items: [] };
  private submissionSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private submissionServerFilters: FilterQueryResponse = {
    filters: ["All"],
    order: ["Last Updated"],
  };
  private submissionThemeList: ThemeQueryResponse = { total: 0, items: [] };

  // You can listen to this eventBus' 'stateUpdate' event and use that to trigger a useState or other function that causes a re-render
  public eventBus = new EventTarget();

  getPublicState() {
    return {
      prevSearchOpts: this.prevSearchOpts,
      prevStarSearchOpts: this.prevStarSearchOpts,
      prevSubSearchOpts: this.prevSubSearchOpts,
      currentTab: this.currentTab,
      apiUrl: this.apiUrl,
      apiShortToken: this.apiShortToken,
      apiFullToken: this.apiFullToken,
      apiTokenExpireDate: this.apiTokenExpireDate,
      apiMeData: this.apiMeData,
      serverFilters: this.serverFilters,
      themeSearchOpts: this.themeSearchOpts,
      localThemeList: this.localThemeList,
      browseThemeList: this.browseThemeList,
      selectedRepo: this.selectedRepo,
      isInstalling: this.isInstalling,
      currentExpandedTheme: this.currentExpandedTheme,
      browserCardSize: this.browserCardSize,
      starredSearchOpts: this.starredSearchOpts,
      starredServerFilters: this.starredServerFilters,
      starredThemeList: this.starredThemeList,
      submissionSearchOpts: this.submissionSearchOpts,
      submissionServerFilters: this.submissionServerFilters,
      submissionThemeList: this.submissionThemeList,
    };
  }

  getGlobalState(key: string) {
    return this[key];
  }

  setGlobalState(key: string, data: any) {
    this[key] = data;
    this.forceUpdate();
  }

  private forceUpdate() {
    this.eventBus.dispatchEvent(new Event("stateUpdate"));
  }
}

const CssLoaderContext = createContext<PublicCssLoaderContext>(null as any);
export const useCssLoaderState = () => useContext(CssLoaderContext);

interface ProviderProps {
  cssLoaderStateClass: CssLoaderState;
}

// This is a React Component that you can wrap multiple separate things in, as long as they both have used the same instance of the CssLoaderState class, they will have synced state
export const CssLoaderContextProvider: FC<ProviderProps> = ({ children, cssLoaderStateClass }) => {
  const [publicState, setPublicState] = useState<PublicCssLoaderState>({
    ...cssLoaderStateClass.getPublicState(),
  });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...cssLoaderStateClass.getPublicState() });
    }

    cssLoaderStateClass.eventBus.addEventListener("stateUpdate", onUpdate);

    return () => cssLoaderStateClass.eventBus.removeEventListener("stateUpdate", onUpdate);
  }, []);

  const getGlobalState = (key: string) => cssLoaderStateClass.getGlobalState(key);
  const setGlobalState = (key: string, data: any) => cssLoaderStateClass.setGlobalState(key, data);

  return (
    <CssLoaderContext.Provider
      value={{
        ...publicState,
        getGlobalState,
        setGlobalState,
      }}
    >
      {children}
    </CssLoaderContext.Provider>
  );
};
