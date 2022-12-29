import { DialogButton, Focusable } from "decky-frontend-lib";
import { useLayoutEffect, useState, FC, useEffect, useRef } from "react";
import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { useCssLoaderState } from "../state";
import { BrowserSearchFields, VariableSizeCard, PageSelector, LoadMoreButton } from "../components";
import { ThemeQueryResponse } from "../apiTypes";
import { generateParamStr } from "../logic";

export const ThemeBrowserPage: FC = () => {
  const {
    browseThemeList: themeArr,
    setBrowseThemeList: setThemeArr,
    setLocalThemeList: setInstalledThemes,
    themeSearchOpts: searchOpts,
    setThemeSearchOpts: setSearchOpts,
    apiShortToken,
    apiFullToken,
    setApiShortToken,
    setApiFullToken,
    setApiMeData,
    setApiTokenExpireDate,
    serverFilters,
    setServerFilters,
    browserCardSize = 3,
    apiUrl,
  } = useCssLoaderState();

  const [backendVersion, setBackendVer] = useState<number>(3);
  function reloadBackendVer() {
    python.resolve(python.getBackendVersion(), setBackendVer);
  }

  function reloadThemes() {
    reloadBackendVer();
    getThemes();
    // Reloads the local themes
    python.resolve(python.reset(), () => {
      python.resolve(python.getThemes(), setInstalledThemes);
    });
  }

  function getInstalledThemes() {
    python.resolve(python.getThemes(), setInstalledThemes);
  }

  function getThemes() {
    const queryStr = generateParamStr(
      searchOpts.filters !== "All" ? searchOpts : { ...searchOpts, filters: "" },
      "CSS."
    );
    python.genericGET(`${apiUrl}/themes${queryStr}`).then((data: ThemeQueryResponse) => {
      if (data.total > 0) {
        setThemeArr(data);
      } else {
        setThemeArr({ total: 0, items: [] });
      }
      setSnapIndex(-1);
    });
  }

  useEffect(() => {
    getThemes();
  }, [searchOpts]);

  function authWithShortToken() {
    python.authWithShortToken(apiShortToken, apiUrl).then((data) => {
      if (data.token) {
        python.storeWrite("shortToken", apiShortToken);
        setApiShortToken(apiShortToken);
        setApiFullToken(data.token);
        setApiTokenExpireDate(new Date().valueOf() + 1000 * 60 * 10);
        python.genericGET(`${apiUrl}/auth/me`, data.token).then((meData) => {
          if (meData?.username) {
            setApiMeData(meData);
            python.toast("Logged In!", `Logged in as ${meData.username}`);
          }
        });
      } else {
        python.toast("Error Authenticating", JSON.stringify(data));
      }
    });
  }

  // Runs upon opening the page every time
  useLayoutEffect(() => {
    reloadBackendVer();
    if (apiShortToken && !apiFullToken) {
      authWithShortToken();
    }
    // Installed themes aren't used on this page, but they are used on other pages, so fetching them here means that as you navigate to the others they will be already loaded
    getInstalledThemes();
  }, []);

  const endOfPageRef = useRef<HTMLElement>();
  const [indexToSnapTo, setSnapIndex] = useState<number>(-1);
  useEffect(() => {
    if (endOfPageRef?.current) {
      endOfPageRef?.current?.focus();
    }
  }, [indexToSnapTo]);

  return (
    <>
      <BrowserSearchFields
        searchOpts={searchOpts}
        setSearchOpts={setSearchOpts}
        unformattedFilters={serverFilters}
        setUnformattedFilters={setServerFilters}
        getTargetsPath="/themes/filters?target=CSS"
        onReload={reloadThemes}
      />
      {/* I wrap everything in a Focusable, because that ensures that the dpad/stick navigation works correctly */}
      <Focusable
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: "5px",
          columnGap: "5px",
        }}
      >
        {themeArr.items
          .filter((e) => e.manifestVersion <= backendVersion)
          .map((e, i) => (
            <VariableSizeCard
              refPassthrough={i === indexToSnapTo ? endOfPageRef : undefined}
              data={e}
              cols={browserCardSize}
              showTarget={searchOpts.filters !== "All"}
            />
          ))}
      </Focusable>
      <div
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "50%" }}>
          <LoadMoreButton
            themeArr={themeArr}
            setThemeArr={setThemeArr}
            origSearchOpts={searchOpts}
            paramStrFilterPrepend="CSS."
            fetchPath="/themes"
            setSnapIndex={setSnapIndex}
          />
        </div>
      </div>
    </>
  );
};
