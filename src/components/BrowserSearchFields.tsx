import {
  DialogButton,
  Dropdown,
  DropdownOption,
  Focusable,
  gamepadDialogClasses,
  gamepadSliderClasses,
  PanelSectionRow,
  SliderField,
  TextField,
} from "decky-frontend-lib";
import { useEffect, useMemo } from "react";
import { TiRefreshOutline } from "react-icons/ti";
import { ThemeQueryRequest } from "../apiTypes";
import * as python from "../python";
import { useCssLoaderState } from "../state";

export function BrowserSearchFields({
  searchOpts,
  setSearchOpts,
  unformattedFilters,
  setUnformattedFilters,
  onReload,
  getTargetsPath,
}: {
  searchOpts: ThemeQueryRequest;
  setSearchOpts: any;
  unformattedFilters: { filters: string[]; order: string[] };
  setUnformattedFilters: any;
  getTargetsPath: string;
  onReload: () => void;
}) {
  const { apiUrl, browserCardSize, setBrowserCardSize } = useCssLoaderState();
  function getThemeTargets() {
    python.genericGET(`${apiUrl}${getTargetsPath}`).then((data) => {
      if (data?.filters) {
        setUnformattedFilters({
          filters: data.filters,
          order: data.order,
        });
      }
    });
  }
  const formattedFilters = useMemo<{ filters: DropdownOption[]; order: DropdownOption[] }>(
    () => ({
      filters: [
        { data: "All", label: "All" },
        ...unformattedFilters.filters.map((e) => ({ data: e, label: e })),
      ],
      order: unformattedFilters.order.map((e) => ({ data: e, label: e })),
    }),
    [unformattedFilters]
  );
  useEffect(() => {
    getThemeTargets();
  }, []);

  const repoOptions: never[] = [];
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
          {/* TODO: re-add 3rd party repo stuff */}
          {/* {repoOptions.length > 1 && (
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
          )} */}
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
            onClick={onReload}
            style={{
              maxWidth: "20%",
              height: "50%",
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
    </>
  );
}
