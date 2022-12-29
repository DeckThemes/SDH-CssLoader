import { SingleDropdownOption } from "decky-frontend-lib";
import { createContext, FC, useContext, useEffect, useState } from "react";
import {
  FilterQueryResponse,
  PartialCSSThemeInfo,
  ThemeQueryRequest,
  ThemeQueryResponse,
  UserInfo,
} from "../apiTypes";
import { localThemeEntry } from "../customTypes";
import { Theme } from "../theme";

interface PublicCssLoaderState {
  apiUrl: string;
  apiShortToken: string;
  apiFullToken: string;
  apiTokenExpireDate: Date | number | undefined;
  apiMeData: UserInfo | undefined;
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
}

// The localThemeEntry interface refers to the theme data as given by the python function, the Theme class refers to a theme after it has been formatted and the generate function has been added

interface PublicCssLoaderContext extends PublicCssLoaderState {
  setApiUrl(data: string): void;
  setApiShortToken(data: string): void;
  setApiFullToken(data: string): void;
  setApiTokenExpireDate(data: Date | number | undefined): void;
  setApiMeData(data: UserInfo | undefined): void;
  setServerFilters(data: FilterQueryResponse): void;
  setThemeSearchOpts(data: ThemeQueryRequest): void;
  setLocalThemeList(listArr: localThemeEntry[]): void;
  setBrowseThemeList(listArr: ThemeQueryResponse): void;
  setRepo(value: SingleDropdownOption): void;
  setInstalling(bool: boolean): void;
  setCurExpandedTheme(theme: PartialCSSThemeInfo | undefined): void;
  setBrowserCardSize(num: number): void;
  setStarredSearchOpts(data: ThemeQueryRequest): void;
  setStarredServerFilters(data: FilterQueryResponse): void;
  setStarredThemeList(data: ThemeQueryResponse): void;
}

// This class creates the getter and setter functions for all of the global state data.
export class CssLoaderState {
  private apiUrl: string = "https://api.deckthemes.com";
  private apiShortToken: string = "";
  private apiFullToken: string = "";
  private apiTokenExpireDate: Date | number | undefined = undefined;
  private apiMeData: UserInfo | undefined = undefined;
  private serverFilters: FilterQueryResponse = {
    filters: ["All"],
    order: ["Alphabetical (A to Z)"],
  };
  private themeSearchOpts: ThemeQueryRequest = {
    page: 1,
    perPage: 10,
    filters: "All",
    order: "Alphabetical (A to Z)",
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
    perPage: 10,
    filters: "All",
    order: "Alphabetical (A to Z)",
    search: "",
  };
  private starredServerFilters: FilterQueryResponse = {
    filters: ["All"],
    order: ["Alphabetical (A to Z)"],
  };
  private starredThemeList: ThemeQueryResponse = { total: 0, items: [] };

  // You can listen to this eventBus' 'stateUpdate' event and use that to trigger a useState or other function that causes a re-render
  public eventBus = new EventTarget();

  getPublicState() {
    return {
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
    };
  }

  setApiUrl(data: string) {
    this.apiUrl = data;
    this.forceUpdate();
  }

  setApiShortToken(data: string) {
    this.apiShortToken = data;
    this.forceUpdate();
  }

  setApiFullToken(data: string) {
    this.apiFullToken = data;
    this.forceUpdate();
  }

  setApiTokenExpireDate(data: Date | number | undefined) {
    this.apiTokenExpireDate = data;
    this.forceUpdate();
  }

  setApiMeData(data: UserInfo | undefined) {
    this.apiMeData = data;
    this.forceUpdate();
  }

  setServerFilters(data: FilterQueryResponse) {
    this.serverFilters = data;
    this.forceUpdate();
  }

  setThemeSearchOpts(data: ThemeQueryRequest) {
    this.themeSearchOpts = data;
    this.forceUpdate();
  }

  setLocalThemeList(listArr: localThemeEntry[]) {
    // This formats the raw data grabbed by the python into the standardized Theme class
    let list: Theme[] = [];

    listArr.forEach((x: any) => {
      let theme = new Theme();
      theme.data = x;
      list.push(theme);
    });
    list.forEach((x) => x.init());

    this.localThemeList = list;
    this.forceUpdate();
  }

  setBrowseThemeList(listArr: ThemeQueryResponse) {
    this.browseThemeList = listArr;
    this.forceUpdate();
  }

  setRepo(value: SingleDropdownOption) {
    this.selectedRepo = value;
    this.forceUpdate();
  }

  setInstalling(bool: boolean) {
    this.isInstalling = bool;
    this.forceUpdate();
  }

  setCurExpandedTheme(theme: PartialCSSThemeInfo | undefined) {
    this.currentExpandedTheme = theme;
    this.forceUpdate();
  }

  setBrowserCardSize(num: number) {
    this.browserCardSize = num;
    this.forceUpdate();
  }

  setStarredSearchOpts(data: ThemeQueryRequest) {
    this.starredSearchOpts = data;
    this.forceUpdate();
  }
  setStarredServerFilters(data: FilterQueryResponse) {
    this.starredServerFilters = data;
    this.forceUpdate();
  }
  setStarredThemeList(data: ThemeQueryResponse) {
    this.starredThemeList = data;
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

  const setApiUrl = (data: string) => cssLoaderStateClass.setApiUrl(data);
  const setApiShortToken = (data: string) => cssLoaderStateClass.setApiShortToken(data);
  const setApiFullToken = (data: string) => cssLoaderStateClass.setApiFullToken(data);
  const setApiTokenExpireDate = (data: Date | number | undefined) =>
    cssLoaderStateClass.setApiTokenExpireDate(data);
  const setApiMeData = (data: UserInfo | undefined) => cssLoaderStateClass.setApiMeData(data);
  const setServerFilters = (data: FilterQueryResponse) =>
    cssLoaderStateClass.setServerFilters(data);
  const setThemeSearchOpts = (data: ThemeQueryRequest) =>
    cssLoaderStateClass.setThemeSearchOpts(data);
  const setLocalThemeList = (listArr: localThemeEntry[]) =>
    cssLoaderStateClass.setLocalThemeList(listArr);
  const setBrowseThemeList = (listArr: ThemeQueryResponse) =>
    cssLoaderStateClass.setBrowseThemeList(listArr);
  const setRepo = (value: SingleDropdownOption) => cssLoaderStateClass.setRepo(value);
  const setInstalling = (bool: boolean) => cssLoaderStateClass.setInstalling(bool);
  const setCurExpandedTheme = (theme: PartialCSSThemeInfo | undefined) =>
    cssLoaderStateClass.setCurExpandedTheme(theme);
  const setBrowserCardSize = (num: number) => cssLoaderStateClass.setBrowserCardSize(num);
  const setStarredSearchOpts = (data: ThemeQueryRequest) => {
    cssLoaderStateClass.setStarredSearchOpts(data);
  };
  const setStarredServerFilters = (data: FilterQueryResponse) => {
    cssLoaderStateClass.setStarredServerFilters(data);
  };
  const setStarredThemeList = (data: ThemeQueryResponse) => {
    cssLoaderStateClass.setStarredThemeList(data);
  };

  return (
    <CssLoaderContext.Provider
      value={{
        ...publicState,
        setApiUrl,
        setApiShortToken,
        setApiFullToken,
        setApiTokenExpireDate,
        setApiMeData,
        setServerFilters,
        setThemeSearchOpts,
        setLocalThemeList,
        setBrowseThemeList,
        setRepo,
        setInstalling,
        setCurExpandedTheme,
        setBrowserCardSize,
        setStarredSearchOpts,
        setStarredServerFilters,
        setStarredThemeList,
      }}
    >
      {children}
    </CssLoaderContext.Provider>
  );
};
