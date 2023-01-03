import { Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../state";
import * as python from "../python";
import { genericGET } from "../api";
import { BrowserSearchFields, LoadMoreButton, VariableSizeCard } from "../components";
import { generateParamStr } from "../logic";
import { ThemeQueryResponse } from "../apiTypes";
import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { refreshToken } from "../api";

export function StarredThemesPage() {
  const {
    apiUrl,
    apiFullToken,
    apiMeData,
    starredSearchOpts: searchOpts,
    starredServerFilters: serverFilters,
    starredThemeList: themeArr,
    browserCardSize,
    prevStarSearchOpts: prevSearchOpts,
    setGlobalState,
  } = useCssLoaderState();

  function reloadThemes() {
    getThemes();
    python.reloadBackend();
  }

  async function getThemes() {
    const newToken = await refreshToken();
    if (newToken) {
      const queryStr = generateParamStr(
        searchOpts.filters !== "All" ? searchOpts : { ...searchOpts, filters: "" },
        "CSS."
      );
      genericGET(`${apiUrl}/users/me/stars${queryStr}`, newToken).then(
        (data: ThemeQueryResponse) => {
          if (data.total > 0) {
            setGlobalState("starredThemeList", data);
          } else {
            setGlobalState("starredThemeList", { total: 0, items: [] });
          }
          setSnapIndex(-1);
        }
      );
    }
  }

  useEffect(() => {
    if (!isEqual(prevSearchOpts, searchOpts) || themeArr.total === 0) {
      getThemes();
    }
  }, [searchOpts, prevSearchOpts, apiMeData]);

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
        searchOptsVarName="starredSearchOpts"
        prevSearchOptsVarName="prevStarSearchOpts"
        unformattedFilters={serverFilters}
        unformattedFiltersVarName="starredServerFilters"
        getTargetsPath="/users/me/stars/filters?type=CSS"
        requiresAuth
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
            showTarget={true}
            searchOpts={searchOpts}
            prevSearchOptsVarName="prevStarSearchOpts"
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
            themeArrVarName="starredThemeList"
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
