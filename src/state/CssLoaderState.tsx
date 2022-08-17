import { SingleDropdownOption } from "decky-frontend-lib";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { localThemeEntry, browseThemeEntry } from "../customTypes";
import { Theme } from "../theme";

interface PublicCssLoaderState {
  localThemeList: Theme[];
  browseThemeList: browseThemeEntry[];
  searchFieldValue: string;
  selectedSort: number;
  selectedTarget: SingleDropdownOption;
  isInstalling: boolean;
  currentExpandedTheme: browseThemeEntry | undefined;
}

// The localThemeEntry interface refers to the theme data as given by the python function, the Theme class refers to a theme after it has been formatted and the generate function has been added

interface PublicCssLoaderContext extends PublicCssLoaderState {
  setLocalThemeList(listArr: localThemeEntry[]): void;
  setBrowseThemeList(listArr: browseThemeEntry[]): void;
  setSearchValue(value: string): void;
  setSort(value: number): void;
  setTarget(value: SingleDropdownOption): void;
  setInstalling(bool: boolean): void;
  setCurExpandedTheme(theme: browseThemeEntry | undefined): void;
}

// This class creates the getter and setter functions for all of the global state data.
export class CssLoaderState {
  private localThemeList: Theme[] = [];
  private browseThemeList: browseThemeEntry[] = [];
  private searchFieldValue: string = "";
  private selectedSort: number = 3;
  private selectedTarget: SingleDropdownOption = {
    data: 1,
    label: "All",
  };
  private isInstalling: boolean = false;
  private currentExpandedTheme: browseThemeEntry | undefined = undefined;

  // You can listen to this eventBus' 'stateUpdate' event and use that to trigger a useState or other function that causes a re-render
  public eventBus = new EventTarget();

  getPublicState() {
    return {
      localThemeList: this.localThemeList,
      browseThemeList: this.browseThemeList,
      searchFieldValue: this.searchFieldValue,
      selectedSort: this.selectedSort,
      selectedTarget: this.selectedTarget,
      isInstalling: this.isInstalling,
      currentExpandedTheme: this.currentExpandedTheme,
    };
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

  setBrowseThemeList(listArr: browseThemeEntry[]) {
    this.browseThemeList = listArr;
    this.forceUpdate();
  }

  setSearchValue(value: string) {
    this.searchFieldValue = value;
    this.forceUpdate();
  }

  setSort(value: number) {
    this.selectedSort = value;
    this.forceUpdate();
  }

  setTarget(value: SingleDropdownOption) {
    this.selectedTarget = value;
    this.forceUpdate();
  }

  setInstalling(bool: boolean) {
    this.isInstalling = bool;
    this.forceUpdate();
  }

  setCurExpandedTheme(theme: browseThemeEntry | undefined) {
    this.currentExpandedTheme = theme;
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
export const CssLoaderContextProvider: FC<ProviderProps> = ({
  children,
  cssLoaderStateClass,
}) => {
  const [publicState, setPublicState] = useState<PublicCssLoaderState>({
    ...cssLoaderStateClass.getPublicState(),
  });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...cssLoaderStateClass.getPublicState() });
    }

    cssLoaderStateClass.eventBus.addEventListener("stateUpdate", onUpdate);

    return () =>
      cssLoaderStateClass.eventBus.removeEventListener("stateUpdate", onUpdate);
  }, []);

  const setLocalThemeList = (listArr: localThemeEntry[]) =>
    cssLoaderStateClass.setLocalThemeList(listArr);
  const setBrowseThemeList = (listArr: browseThemeEntry[]) =>
    cssLoaderStateClass.setBrowseThemeList(listArr);
  const setSearchValue = (value: string) =>
    cssLoaderStateClass.setSearchValue(value);
  const setSort = (value: number) => cssLoaderStateClass.setSort(value);
  const setTarget = (value: SingleDropdownOption) =>
    cssLoaderStateClass.setTarget(value);
  const setInstalling = (bool: boolean) =>
    cssLoaderStateClass.setInstalling(bool);
  const setCurExpandedTheme = (theme: browseThemeEntry | undefined) =>
    cssLoaderStateClass.setCurExpandedTheme(theme);

  return (
    <CssLoaderContext.Provider
      value={{
        ...publicState,
        setLocalThemeList,
        setBrowseThemeList,
        setSearchValue,
        setSort,
        setTarget,
        setInstalling,
        setCurExpandedTheme,
      }}
    >
      {children}
    </CssLoaderContext.Provider>
  );
};
