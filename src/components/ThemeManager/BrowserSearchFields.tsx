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
import { useEffect, useMemo, memo } from "react";
import { TiRefreshOutline } from "react-icons/ti";
import { FaRotate } from "react-icons/fa6";
import { ThemeQueryRequest } from "../../apiTypes";
import { genericGET } from "../../api";
import { useCssLoaderState } from "../../state";
import { FilterDropdownCustomLabel } from "./FilterDropdownCustomLabel";

export function BrowserSearchFields({
  searchOpts,
  searchOptsVarName,
  prevSearchOptsVarName,
  unformattedFilters,
  unformattedFiltersVarName,
  onReload,
  requiresAuth = false,
  getTargetsPath,
}: {
  searchOpts: ThemeQueryRequest;
  searchOptsVarName: string;
  prevSearchOptsVarName: string;
  unformattedFilters: { filters: string[]; order: string[] };
  unformattedFiltersVarName: string;
  getTargetsPath: string;
  requiresAuth?: boolean;
  onReload: () => void;
}) {
  const { browserCardSize, setGlobalState } = useCssLoaderState();

  async function getThemeTargets() {
    genericGET(`${getTargetsPath}`, requiresAuth).then((data) => {
      if (data?.filters) {
        setGlobalState(unformattedFiltersVarName, {
          filters: data.filters,
          order: data.order,
        });
      }
    });
  }

  const formattedFilters = useMemo<{ filters: DropdownOption[]; order: DropdownOption[] }>(
    () => ({
      filters: [
        {
          data: "All",
          label: (
            <FilterDropdownCustomLabel
              filterValue="All"
              itemCount={
                Object.values(unformattedFilters.filters).reduce(
                  (prev, cur) => prev + Number(cur),
                  0
                ) || ""
              }
            />
          ),
        },
        ...Object.entries(unformattedFilters.filters)
          .filter(([_, itemCount]) => Number(itemCount) > 0)
          .map(([filterValue, itemCount]) => ({
            data: filterValue,
            label: <FilterDropdownCustomLabel filterValue={filterValue} itemCount={itemCount} />,
          })),
      ],
      order: unformattedFilters.order.map((e) => ({ data: e, label: e })),
    }),
    [unformattedFilters]
  );
  useEffect(() => {
    if (unformattedFilters.filters.length < 2) {
      getThemeTargets();
    }
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
              maxWidth: repoOptions.length <= 1 ? "49%" : "33%",
              minWidth: repoOptions.length <= 1 ? "49%" : "33%",
            }}
          >
            <span className="DialogLabel">Sort</span>
            <Dropdown
              menuLabel="Sort"
              rgOptions={formattedFilters.order}
              strDefaultLabel="Last Updated (Newest)"
              selectedOption={searchOpts.order}
              onChange={(e) => {
                setGlobalState(prevSearchOptsVarName, searchOpts);
                setGlobalState(searchOptsVarName, { ...searchOpts, order: e.data });
              }}
            />
          </div>
          <div
            className="CSSLoader_FilterDropDown_Container"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: repoOptions.length <= 1 ? "49%" : "33%",
              minWidth: repoOptions.length <= 1 ? "49%" : "33%",
              marginLeft: "auto",
            }}
          >
            <span className="DialogLabel">Filter</span>
            <Dropdown
              menuLabel="Filter"
              rgOptions={formattedFilters.filters}
              strDefaultLabel="All"
              selectedOption={searchOpts.filters}
              onChange={(e) => {
                setGlobalState(prevSearchOptsVarName, searchOpts);
                setGlobalState(searchOptsVarName, { ...searchOpts, filters: e.data });
              }}
            />
            <style>
              {/* The CSS Selector god has done it again */}
              {`
                .CSSLoader_FilterDropDown_Container > button > div > div {
                  width: 100%;
                  display: flex;
                  align-items: start;
                }
                .CSSLoader_FilterDropDown_Container > button > div > .${gamepadDialogClasses.Spacer} {
                  width: 0;
                }
              `}
            </style>
          </div>
        </Focusable>
      </PanelSectionRow>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Focusable style={{ display: "flex", alignItems: "center", width: "96%" }}>
          <div style={{ minWidth: "55%", marginRight: "auto" }}>
            <TextField
              label="Search"
              value={searchOpts.search}
              onChange={(e) => {
                setGlobalState(prevSearchOptsVarName, searchOpts);
                setGlobalState(searchOptsVarName, { ...searchOpts, search: e.target.value });
              }}
            />
          </div>
          <DialogButton
            onClick={onReload}
            style={{
              maxWidth: "20%",
              height: "50%",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5em",
              display: "flex",
            }}
          >
            <FaRotate />
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
                setGlobalState("browserCardSize", num);
              }}
            />
          </div>
          <style>
            {`
              /* PRE Aug. 18th Beta*/
              /* call me the css selector god */
              /* these scale the slider to the correct size regardless of display resolution */
              .CssLoader_ThemeBrowser_ScaleSlider > div > .${gamepadDialogClasses.FieldChildren} {
                min-width: 100% !important;
              }

              .CssLoader_ThemeBrowser_ScaleSlider > div > div > .${
                gamepadSliderClasses.SliderControlWithIcon
              }.Panel.Focusable {
                width: 100%;
              }

              /* POST Aug. 18th Beta */
              .CssLoader_ThemeBrowser_ScaleSlider > div > div > .${
                // @ts-ignore
                gamepadDialogClasses.FieldChildrenInner
              } {
                min-width: 100% !important;
              }
            `}
          </style>
        </Focusable>
      </div>
    </>
  );
}

export const MemoizedSearchFields = memo(BrowserSearchFields);
