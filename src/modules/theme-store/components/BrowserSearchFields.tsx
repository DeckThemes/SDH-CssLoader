import { useMemo } from "react";
import {
  useThemeBrowserSharedStateAction,
  useThemeBrowserSharedStateValue,
  useThemeBrowserStoreAction,
  useThemeBrowserStoreValue,
} from "../context";
import {
  DialogButton,
  Dropdown,
  DropdownOption,
  Focusable,
  PanelSectionRow,
  SliderField,
  TextField,
} from "@decky/ui";
import { FilterOptionLabel } from "./FilterOptionLabel";
import { FaRotate } from "react-icons/fa6";

export function BrowserSearchFields() {
  const { filters, order } = useThemeBrowserStoreValue("filterOptions");
  const searchOpts = useThemeBrowserStoreValue("searchOpts");
  const setSearchOpts = useThemeBrowserStoreAction("setSearchOpts");
  const refreshThemes = useThemeBrowserStoreAction("refreshThemes");

  const browserCardSize = useThemeBrowserSharedStateValue("browserCardSize");
  const setBrowserCardSize = useThemeBrowserSharedStateAction("setBrowserCardSize");

  const formattedFilters: DropdownOption[] = useMemo(() => {
    const totalNumOptions = Object.values(filters).reduce((acc, cur) => acc + Number(cur), 0);
    return [
      { data: "All", label: <FilterOptionLabel text="All" itemCount={totalNumOptions} /> },
      ...Object.entries(filters)
        .filter(([_, itemCount]) => Number(itemCount) > 0)
        .map(([name, itemCount]) => ({
          data: name,
          label: <FilterOptionLabel text={name} itemCount={itemCount} />,
        })),
    ];
  }, [filters]);

  return (
    <>
      <PanelSectionRow>
        <Focusable className="flex w-full justify-between">
          <div className="cl-store-filter-field-container">
            <span className="DialogLabel">Sort</span>
            <Dropdown
              menuLabel="Sort"
              rgOptions={order.map((e) => ({ data: e, label: e }))}
              strDefaultLabel="Last Updated"
              selectedOption={searchOpts.order}
              onChange={(value) => {
                const newSearchOpts = { ...searchOpts, order: value.data };
                setSearchOpts(newSearchOpts);
              }}
            />
          </div>
          <div className="cl-store-filter-field-container cl-store-dropdown-hide-spacer">
            <span className="DialogLabel">Filter</span>
            <Dropdown
              menuLabel="Filter"
              rgOptions={formattedFilters}
              strDefaultLabel="All"
              selectedOption={searchOpts.filters}
              onChange={(value) => {
                const newSearchOpts = { ...searchOpts, filters: value.data };
                setSearchOpts(newSearchOpts);
              }}
            />
          </div>
        </Focusable>
      </PanelSectionRow>
      <PanelSectionRow>
        <Focusable className="flex items-center w-full justify-between">
          <div className="cl-store-searchbar">
            <TextField
              label="Search"
              value={searchOpts.search}
              onChange={(event) => {
                const newSearchOpts = { ...searchOpts, search: event.target.value };
                setSearchOpts(newSearchOpts);
              }}
            />
          </div>
          <DialogButton onClick={refreshThemes} className="cl-store-refresh-button">
            <FaRotate />
            <span>Refresh</span>
          </DialogButton>
          <div
            style={{ maxWidth: "20%", minWidth: "20%", marginLeft: "auto" }}
            className="cl-store-scale-slider"
          >
            <SliderField
              min={3}
              max={5}
              step={1}
              value={browserCardSize}
              onChange={setBrowserCardSize}
            />
          </div>
        </Focusable>
      </PanelSectionRow>
    </>
  );
}
