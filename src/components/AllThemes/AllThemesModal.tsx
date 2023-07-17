import { useMemo } from "react";
import {
  ButtonItem,
  Focusable,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
  gamepadDialogClasses,
  showModal,
} from "decky-frontend-lib";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "../../state";
import { Flags } from "../../ThemeTypes";
import { AllThemesSingleEntry } from "./AllThemesSingleEntry";
import { PresetSelectionDropdown } from "../QAMTab/PresetSelectionDropdown";
import { globalState } from "../../python";

export function AllThemesModalRoot({ closeModal }: { closeModal: any }) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={globalState}>
        <AllThemesModal closeModal={closeModal} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

export function AllThemesModal({ closeModal }: { closeModal: any }) {
  const { localThemeList, unpinnedThemes } = useCssLoaderState();

  const sortedList = useMemo(() => {
    return localThemeList
      .filter((e) => !e.flags.includes(Flags.isPreset))
      .sort((a, b) => {
        const aPinned = !unpinnedThemes.includes(a.id);
        const bPinned = !unpinnedThemes.includes(b.id);
        // This sorts the pinned themes alphabetically, then the non-pinned alphabetically
        if (aPinned === bPinned) {
          return a.name.localeCompare(b.name);
        }
        return Number(bPinned) - Number(aPinned);
      });
  }, [localThemeList.length]);

  return (
    <>
      {/* <h1 style={{ marginBlockEnd: "10px", marginBlockStart: "0px" }}>Your Themes</h1> */}
      <style>
        {`
          .CSSLoader_PanelSection_NoPadding_Parent > .quickaccesscontrols_PanelSection_2C0g0 {
            padding-left: 0;
            padding-right: 0;
          }

          .CSSLoader_FullTheme_ToggleContainer > div {
            background: #23262e;
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
          }
          .CSSLoader_FullTheme_ToggleContainer {
            flex-grow: 1;
          }
          .CSSLoader_FullTheme_EntryContainer {
            display: flex;
            gap: 0.25em;
            height: auto;
            align-items: center;
            position: relative;
            justify-content: space-between;
          }
          .CSSLoader_FullTheme_DialogButton {
            width: fit-content !important;
            min-width: fit-content !important;
            height: fit-content !important;
            padding: 10px 12px !important;
          }
          .CSSLoader_FullTheme_IconTranslate {
            transform: translate(0px, 2px);
          }
          .CSSLoader_FullTheme_ThemeLabel {
            white-space: nowrap;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>
      <div className="CSSLoader_PanelSection_NoPadding_Parent">
        <PanelSection title="Your Themes">
          <Focusable
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: "1em" }}
          >
            {sortedList.map((e) => (
              <AllThemesSingleEntry data={e} />
            ))}
          </Focusable>
        </PanelSection>
        <PanelSection title="Profiles">
          <PresetSelectionDropdown />
        </PanelSection>
      </div>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            closeModal();
          }}
        >
          Close
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}
