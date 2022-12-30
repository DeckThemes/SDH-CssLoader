import { Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../state";
import * as python from "../python";
import { BrowserSearchFields, LoadMoreButton, VariableSizeCard } from "../components";
import { generateParamStr } from "../logic";
import { ThemeQueryResponse } from "../apiTypes";
import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";

export function SubmissionsPage() {
  const {
    apiUrl,
    apiFullToken,
    apiTokenExpireDate,
    setApiFullToken,
    setApiTokenExpireDate,
    setLocalThemeList: setInstalledThemes,
    submissionSearchOpts: searchOpts,
    setSubmissionSearchOpts: setSearchOpts,
    submissionServerFilters: serverFilters,
    setSubmissionServerFilters: setServerFilters,
    submissionThemeList: themeArr,
    setSubmissionThemeList: setThemeArr,
    browserCardSize,
    setPrevSubSearchOpts: setPrevSearchOpts,
    prevSubSearchOpts: prevSearchOpts,
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
        .genericGET(`${apiUrl}/themes/awaiting_approval${queryStr}`, newToken)
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
    if (!isEqual(prevSearchOpts, searchOpts) || themeArr.total === 0) {
      getThemes();
    }
  }, [searchOpts, prevSearchOpts]);

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
        setPrevSearchOpts={setPrevSearchOpts}
        unformattedFilters={serverFilters}
        setUnformattedFilters={setServerFilters}
        getTargetsPath="/themes/awaiting_approval/filters?target=CSS"
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
            fetchPath="/themes/awaiting_approval"
            setSnapIndex={setSnapIndex}
          />
        </div>
      </div>
    </>
  );
}
