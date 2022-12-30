import { Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../state";
import * as python from "../python";
import { BrowserSearchFields, LoadMoreButton, VariableSizeCard } from "../components";
import { generateParamStr } from "../logic";
import { ThemeQueryResponse } from "../apiTypes";
import { useEffect, useRef, useState } from "react";

export function StarredThemesPage() {
  const {
    apiUrl,
    apiFullToken,
    apiTokenExpireDate,
    setApiFullToken,
    setApiTokenExpireDate,
    setLocalThemeList: setInstalledThemes,
    starredSearchOpts: searchOpts,
    setStarredSearchOpts: setSearchOpts,
    starredServerFilters: serverFilters,
    setStarredServerFilters: setServerFilters,
    starredThemeList: themeArr,
    setStarredThemeList: setThemeArr,
    browserCardSize,
  } = useCssLoaderState();

  function reloadThemes() {
    getThemes();
    python.resolve(python.reset(), () => {
      python.resolve(python.getThemes(), setInstalledThemes);
    });
  }

  // This returns the token that is intended to be used in whatever call
  function refreshToken() {
    if (!apiFullToken) {
      return undefined;
    }
    if (apiTokenExpireDate === undefined) {
      return apiFullToken;
    }
    if (new Date().valueOf() < apiTokenExpireDate) {
      return apiFullToken;
    }
    return python.refreshToken(`${apiUrl}/auth/refresh_token`, apiFullToken).then((token) => {
      setApiFullToken(token);
      setApiTokenExpireDate(new Date().valueOf() + 1000 * 10 * 60);
      return token;
    });
  }

  async function getThemes() {
    const newToken = await refreshToken();
    if (newToken) {
      const queryStr = generateParamStr(
        searchOpts.filters !== "All" ? searchOpts : { ...searchOpts, filters: "" },
        "CSS."
      );
      python
        .genericGET(`${apiUrl}/users/me/stars${queryStr}`, newToken)
        .then((data: ThemeQueryResponse) => {
          if (data.total > 0) {
            setThemeArr(data);
          } else {
            setThemeArr({ total: 0, items: [] });
          }
          setSnapIndex(-1);
        });
    }
  }

  useEffect(() => {
    getThemes();
  }, [searchOpts]);

  const endOfPageRef = useRef<HTMLElement>();
  const [indexToSnapTo, setSnapIndex] = useState<number>(-1);
  useEffect(() => {
    if (endOfPageRef?.current) {
      endOfPageRef?.current?.focus();
    }
  }, [indexToSnapTo]);

  if (!apiFullToken) {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>You Are Not Logged In!</span>
          <span>Link your deck to your deckthemes.com account to sync Starred Themes</span>
        </div>
      </>
    );
  }
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
      <Focusable
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: "5px",
          columnGap: "5px",
        }}
      >
        {themeArr.items.map((e, i) => (
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
            fetchPath="/users/me/stars"
            setSnapIndex={setSnapIndex}
          />
        </div>
      </div>
    </>
  );
}
