import { SingleDropdownOption } from "decky-frontend-lib";
import { createContext, FC, useContext, useEffect, useState } from "react";
import {
  AccountData,
  FilterQueryResponse,
  PartialCSSThemeInfo,
  ThemeQueryRequest,
  ThemeQueryResponse,
} from "../apiTypes";
import { Theme } from "../ThemeTypes";

interface PublicCssLoaderState {
  // Browse Page
  serverFilters: FilterQueryResponse;
  prevSearchOpts: ThemeQueryRequest;
  browseThemeList: ThemeQueryResponse;
  themeSearchOpts: ThemeQueryRequest;

  // Starred Themes Page
  starredSearchOpts: ThemeQueryRequest;
  starredServerFilters: FilterQueryResponse;
  starredThemeList: ThemeQueryResponse;
  prevStarSearchOpts: ThemeQueryRequest;

  // Submission Page
  prevSubSearchOpts: ThemeQueryRequest;
  submissionSearchOpts: ThemeQueryRequest;
  submissionServerFilters: FilterQueryResponse;
  submissionThemeList: ThemeQueryResponse;

  currentTab: string;

  // Api
  selectedRepo: SingleDropdownOption;
  apiUrl: string;
  apiShortToken: string;
  apiFullToken: string;
  apiTokenExpireDate: Date | number | undefined;
  apiMeData: AccountData | undefined;

  localThemeList: Theme[];
  currentSettingsPageTheme: string | undefined;
  unpinnedThemes: string[];
  isInstalling: boolean;
  currentExpandedTheme: PartialCSSThemeInfo | undefined;
  browserCardSize: number;
  backendVersion: number;
}

interface PublicCssLoaderContext extends PublicCssLoaderState {
  setGlobalState(key: string, data: any): void;
  getGlobalState(key: string): any;
}

// This class creates the getter and setter functions for all of the global state data.
export class CssLoaderState {
  private currentTab: string = "ThemeBrowser";

  private apiUrl: string = "https://api.deckthemes.com";
  private apiShortToken: string = "";
  private apiFullToken: string = "";
  private apiTokenExpireDate: Date | number | undefined = undefined;
  private apiMeData: AccountData | undefined = undefined;
  private localThemeList: Theme[] = [];
  private selectedRepo: SingleDropdownOption = {
    data: 1,
    label: "All",
  };
  private isInstalling: boolean = false;
  private currentExpandedTheme: PartialCSSThemeInfo | undefined = undefined;
  private browserCardSize: number = 3;

  private browseThemeList: ThemeQueryResponse = { total: 0, items: [] };
  private prevSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
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

  // Stars
  private prevStarSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
  private currentSettingsPageTheme: string | undefined = undefined;
  private unpinnedThemes: string[] = [];

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

  // Submissions
  private prevSubSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 50,
    filters: "All",
    order: "Last Updated",
    search: "",
  };
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
  private backendVersion: number = 6;

  // You can listen to this eventBus' 'stateUpdate' event and use that to trigger a useState or other function that causes a re-render
  public eventBus = new EventTarget();

  getPublicState() {
    return {
      currentTab: this.currentTab,
      apiUrl: this.apiUrl,
      apiShortToken: this.apiShortToken,
      apiFullToken: this.apiFullToken,
      apiTokenExpireDate: this.apiTokenExpireDate,
      apiMeData: this.apiMeData,
      localThemeList: this.localThemeList,
      currentSettingsPageTheme: this.currentSettingsPageTheme,
      unpinnedThemes: this.unpinnedThemes,
      isInstalling: this.isInstalling,

      selectedRepo: this.selectedRepo,
      currentExpandedTheme: this.currentExpandedTheme,
      browserCardSize: this.browserCardSize,

      // Browse Page
      themeSearchOpts: this.themeSearchOpts,
      serverFilters: this.serverFilters,
      browseThemeList: this.browseThemeList,
      prevSearchOpts: this.prevSearchOpts,

      // Starred
      prevStarSearchOpts: this.prevStarSearchOpts,
      starredSearchOpts: this.starredSearchOpts,
      starredServerFilters: this.starredServerFilters,
      starredThemeList: this.starredThemeList,

      // Submissions
      prevSubSearchOpts: this.prevSubSearchOpts,
      submissionSearchOpts: this.submissionSearchOpts,
      submissionServerFilters: this.submissionServerFilters,
      submissionThemeList: this.submissionThemeList,
      backendVersion: this.backendVersion,
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
