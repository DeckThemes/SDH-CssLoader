import { Focusable } from "decky-frontend-lib";
import { useLayoutEffect, useState, FC, useEffect, useRef } from "react";
import * as python from "../../python";
import { getThemes } from "../../api";
import { logInWithShortToken } from "../../api";
import { isEqual } from "lodash";

// Interfaces for the JSON objects the lists work with
import { useCssLoaderState } from "../../state";
import { BrowserSearchFields, VariableSizeCard, LoadMoreButton } from "../../components";

export const ThemeBrowserPage: FC = () => {
  const {
    browseThemeList: themeArr,
    themeSearchOpts: searchOpts,
    apiShortToken,
    apiFullToken,
    serverFilters,
    browserCardSize = 3,
    prevSearchOpts,
    backendVersion,
  } = useCssLoaderState();

  function reloadThemes() {
    getThemes(searchOpts, "/themes", "browseThemeList", setSnapIndex);
    python.reloadBackend();
  }

  useEffect(() => {
    if (!isEqual(prevSearchOpts, searchOpts) || themeArr.total === 0) {
      getThemes(searchOpts, "/themes", "browseThemeList", setSnapIndex);
    }
  }, [searchOpts, prevSearchOpts]);

  // Runs upon opening the page every time
  useLayoutEffect(() => {
    python.getBackendVersion();
    if (apiShortToken && !apiFullToken) {
      logInWithShortToken();
    }
    // Installed themes aren't used on this page, but they are used on other pages, so fetching them here means that as you navigate to the others they will be already loaded
    python.getInstalledThemes();
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
        searchOptsVarName="themeSearchOpts"
        prevSearchOptsVarName="prevSearchOpts"
        unformattedFilters={serverFilters}
        unformattedFiltersVarName="serverFilters"
        getTargetsPath="/themes/filters?type=CSS"
        onReload={() => {
          reloadThemes();
        }}
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
              showTarget={true}
              searchOpts={searchOpts}
              prevSearchOptsVarName="prevSearchOpts"
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
            themeArrVarName="browseThemeList"
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
