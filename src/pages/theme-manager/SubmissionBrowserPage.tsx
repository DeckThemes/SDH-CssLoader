import { Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import * as python from "../../python";
import { BrowserSearchFields, LoadMoreButton, VariableSizeCard } from "../../components";
import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { getThemes } from "../../api";

export function SubmissionsPage() {
  const {
    apiFullToken,
    submissionSearchOpts: searchOpts,
    submissionServerFilters: serverFilters,
    submissionThemeList: themeArr,
    browserCardSize,
    prevSubSearchOpts: prevSearchOpts,
    apiMeData,
    backendVersion,
  } = useCssLoaderState();

  function reloadThemes() {
    getThemes(searchOpts, "/themes/awaiting_approval", "submissionThemeList", setSnapIndex, true);
    python.reloadBackend();
  }

  useEffect(() => {
    if (!isEqual(prevSearchOpts, searchOpts) || themeArr.total === 0) {
      getThemes(searchOpts, "/themes/awaiting_approval", "submissionThemeList", setSnapIndex, true);
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
        searchOptsVarName="submissionSearchOpts"
        prevSearchOptsVarName="prevSubSearchOpts"
        unformattedFilters={serverFilters}
        unformattedFiltersVarName="submissionServerFilters"
        getTargetsPath="/themes/awaiting_approval/filters?type=CSS"
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
        {themeArr.items
          .filter((e) => e.manifestVersion <= backendVersion)
          .map((e, i) => (
            <VariableSizeCard
              refPassthrough={i === indexToSnapTo ? endOfPageRef : undefined}
              data={e}
              cols={browserCardSize}
              searchOpts={searchOpts}
              prevSearchOptsVarName="setPrevSubSearchOpts"
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
            themeArrVarName="submissionThemeList"
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
