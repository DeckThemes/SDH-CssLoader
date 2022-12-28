import {
  PanelSectionRow,
  Focusable,
  TextField,
  DropdownOption,
  Dropdown,
  DialogButton,
  SliderField,
  gamepadSliderClasses,
  gamepadDialogClasses,
} from "decky-frontend-lib";
import { useLayoutEffect, useMemo, useState, FC, useEffect } from "react";

import { TiRefreshOutline } from "react-icons/ti";

// import "../styles/fullheightcard.css";
import * as python from "../python";

// Interfaces for the JSON objects the lists work with
import { useCssLoaderState } from "../state";
import { VariableSizeCard } from "../components";
import { ThemeQueryResponse } from "../apiTypes";
import { generateParamStr } from "../logic";
import { PageSelector } from "../components/PageSelector";

export const ThemeBrowserPage: FC = () => {
  const {
    browseThemeList: themeArr,
    setBrowseThemeList: setThemeArr,
    setLocalThemeList: setInstalledThemes,
    themeSearchOpts: searchOpts,
    setThemeSearchOpts: setSearchOpts,
    serverFilters,
    setServerFilters,
    selectedRepo,
    setRepo,
    browserCardSize = 3,
    setBrowserCardSize,
    apiUrl,
  } = useCssLoaderState();

  const [backendVersion, setBackendVer] = useState<number>(3);
  function reloadBackendVer() {
    python.resolve(python.getBackendVersion(), setBackendVer);
  }

  const formattedFilters = useMemo<{ filters: DropdownOption[]; order: DropdownOption[] }>(
    () => ({
      filters: [
        { data: "All", label: "All" },
        ...serverFilters.filters.map((e) => ({ data: e, label: e })),
      ],
      order: serverFilters.order.map((e) => ({ data: e, label: e })),
    }),
    [serverFilters]
  );

  const repoOptions = useMemo((): DropdownOption[] => {
    const uniqueRepos = new Set(themeArr.items.map((e) => e.repo));
    // Spread operator is to turn set into array
    if ([...uniqueRepos].length <= 1) {
      // This says All but really is just official
      return [{ data: 1, label: "All" }];
    } else {
      return [
        { data: 1, label: "All" },
        { data: 2, label: "Official" },
        { data: 3, label: "3rd Party" },
      ];
    }
  }, [themeArr]);

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

  function getThemeTargets() {
    python.genericGET("${apiUrl}themes/filters?target=CSS").then((data) => {
      if (data?.filters) {
        setServerFilters({
          filters: data.filters,
          order: data.order,
        });
      }
    });
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
    });
  }

  useEffect(() => {
    getThemes();
  }, [searchOpts]);

  // Runs upon opening the page every time
  useLayoutEffect(() => {
    reloadBackendVer();
    // Installed themes aren't used on this page, but they are used on other pages, so fetching them here means that as you navigate to the others they will be already loaded
    getInstalledThemes();
    getThemeTargets();
  }, []);

  return (
    <>
      <PanelSectionRow>
        <Focusable style={{ display: "flex", maxWidth: "100%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: repoOptions.length <= 1 ? "40%" : "33%",
              minWidth: repoOptions.length <= 1 ? "40%" : "33%",
            }}
          >
            <span>Sort</span>
            <Dropdown
              menuLabel="Sort"
              rgOptions={formattedFilters.order}
              strDefaultLabel="Last Updated (Newest)"
              selectedOption={searchOpts.order}
              onChange={(e) => setSearchOpts({ ...searchOpts, order: e.data })}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: repoOptions.length <= 1 ? "40%" : "33%",
              minWidth: repoOptions.length <= 1 ? "40%" : "33%",
              marginLeft: "auto",
            }}
          >
            <span>Filter</span>
            <Dropdown
              menuLabel="Filter"
              rgOptions={formattedFilters.filters}
              strDefaultLabel="All"
              selectedOption={searchOpts.filters}
              onChange={(e) => setSearchOpts({ ...searchOpts, filters: e.data })}
            />
          </div>
          {repoOptions.length > 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "30%",
                minWidth: "30%",
                marginLeft: "auto",
              }}
            >
              <span>Repo</span>
              <Dropdown
                menuLabel="Filter"
                rgOptions={repoOptions}
                strDefaultLabel="Official"
                selectedOption={selectedRepo.data}
                onChange={(e) => setRepo(e)}
              />
            </div>
          )}
        </Focusable>
      </PanelSectionRow>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Focusable style={{ display: "flex", alignItems: "center", width: "96%" }}>
          <div style={{ minWidth: "55%", marginRight: "auto" }}>
            <TextField
              label="Search"
              value={searchOpts.search}
              onChange={(e) => setSearchOpts({ ...searchOpts, search: e.target.value })}
            />
          </div>
          <DialogButton
            onClick={() => {
              reloadThemes();
            }}
            style={{
              maxWidth: "20%",
              height: "50%",
              // marginRight: "auto",
              // marginLeft: "auto",
            }}
          >
            <TiRefreshOutline style={{ transform: "translate(0, 2px)" }} />
            <span>Refresh</span>
          </DialogButton>
          <div
            style={{ maxWidth: "20%", minWidth: "20%", marginLeft: "auto" }}
            className="CssLoader_ThemeBrowser_ScaleSlider"
          >
            <SliderField
              min={3}
              max={5}
              step={1}
              value={browserCardSize}
              onChange={(num) => {
                setBrowserCardSize(num);
              }}
            />
          </div>
          <style>
            {`
              /* call me the css selector god */
              /* these scale the slider to the correct size regardless of display resolution */
              .CssLoader_ThemeBrowser_ScaleSlider > div > .${gamepadDialogClasses.FieldChildren} {
                min-width: 100% !important;
              }

              .CssLoader_ThemeBrowser_ScaleSlider > div > div > .${gamepadSliderClasses.SliderControlWithIcon}.Panel.Focusable {
                width: 100%;
              }
            `}
          </style>
        </Focusable>
      </div>
      {/* I wrap everything in a Focusable, because that ensures that the dpad/stick navigation works correctly */}
      {/* The margin here is there because the card items themselves dont have margin left */}
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
          .map((e) => (
            <VariableSizeCard
              data={e}
              cols={browserCardSize}
              showTarget={searchOpts.filters !== "All"}
            />
          ))}
      </Focusable>
      <PageSelector
        total={themeArr.total}
        perPage={searchOpts.perPage}
        currentPage={searchOpts.page}
        onChoose={(e) => setSearchOpts({ ...searchOpts, page: e })}
      />
    </>
  );
};
