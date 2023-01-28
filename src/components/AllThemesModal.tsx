import {
  ButtonItem,
  DialogButton,
  DialogCheckbox,
  Focusable,
  gamepadDialogClasses,
  ModalRoot,
  showModal,
  Toggle,
  ToggleField,
} from "decky-frontend-lib";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "../state";
import { ThemeSettingsModalRoot } from "./ThemeSettingsModal";
import * as python from "../python";
import { Flags } from "../ThemeTypes";
import { ImCog } from "react-icons/im";

export function AllThemesModalRoot({
  stateClass,
  closeModal,
}: {
  stateClass: CssLoaderState;
  closeModal: any;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <CssLoaderContextProvider cssLoaderStateClass={stateClass}>
        <AllThemesModal stateClass={stateClass} closeModal={closeModal} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

export function AllThemesModal({
  stateClass,
  closeModal,
}: {
  stateClass: CssLoaderState;
  closeModal: any;
}) {
  const { localThemeList, pinnedThemes, setGlobalState } = useCssLoaderState();
  return (
    <>
      <h1 style={{ marginBlockEnd: "10px", marginBlockStart: "0px" }}>Your Themes</h1>
      <style>
        {`
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
      <Focusable style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: "1em" }}>
        {localThemeList
          .sort((a, b) => {
            const aPinned = pinnedThemes.includes(a.id);
            const bPinned = pinnedThemes.includes(b.id);
            // This sorts the pinned themes alphabetically, then the non-pinned alphabetically
            if (aPinned === bPinned) {
              return a.name.localeCompare(b.name);
            }
            return Number(bPinned) - Number(aPinned);
          })
          .map((e) => {
            const isPinned = pinnedThemes.includes(e.id);
            return (
              <>
                <div className="CSSLoader_FullTheme_EntryContainer">
                  <div className="CSSLoader_FullTheme_ToggleContainer">
                    <ToggleField
                      bottomSeparator="none"
                      label={<span className="CSSLoader_FullTheme_ThemeLabel">{e.name}</span>}
                      checked={e.enabled}
                      onChange={(switchValue: boolean) => {
                        // Actually enabling the theme
                        python.resolve(python.setThemeState(e.name, switchValue), () => {
                          python.getInstalledThemes();
                        });
                        // Dependency Toast
                        if (e.dependencies.length > 0) {
                          if (switchValue === true) {
                            python.toast(
                              `${e.name} enabled other themes`,
                              // This lists out the themes by name, but often overflowed off screen
                              // @ts-ignore
                              // `${new Intl.ListFormat().format(data.dependencies)} ${
                              //   data.dependencies.length > 1 ? "are" : "is"
                              // } required for this theme`
                              // This just gives the number of themes
                              `${
                                e.dependencies.length === 1
                                  ? `1 other theme is required by ${e.name}`
                                  : `${e.dependencies.length} other themes are required by ${e.name}`
                              }`
                            );
                            return;
                          }
                          if (!e.flags.includes(Flags.dontDisableDeps)) {
                            python.toast(
                              `${e.name} disabled other themes`,
                              // @ts-ignore
                              `${
                                e.dependencies.length === 1
                                  ? `1 theme was originally enabled by ${e.name}`
                                  : `${e.dependencies.length} themes were originally enabled by ${e.name}`
                              }`
                            );
                            return;
                          }
                        }
                      }}
                    />
                  </div>
                  <DialogButton
                    className="CSSLoader_FullTheme_DialogButton"
                    onClick={() => {
                      let newArr: string[] = [];
                      if (isPinned) {
                        newArr = pinnedThemes.filter((id) => id !== e.id);
                      } else {
                        newArr = [...pinnedThemes, e.id];
                      }
                      python.storeWrite("pinnedThemes", JSON.stringify(newArr));
                      setGlobalState("pinnedThemes", newArr);
                    }}
                  >
                    {isPinned ? (
                      <BsPinAngleFill
                        color="#FFA500"
                        className="CSSLoader_FullTheme_IconTranslate"
                      />
                    ) : (
                      <BsPinAngle className="CSSLoader_FullTheme_IconTranslate" />
                    )}
                  </DialogButton>
                  <DialogButton
                    className="CSSLoader_FullTheme_DialogButton"
                    onClick={() => {
                      showModal(
                        // @ts-ignore
                        <ThemeSettingsModalRoot stateClass={stateClass} selectedTheme={e.id} />
                      );
                    }}
                  >
                    <ImCog className="CSSLoader_FullTheme_IconTranslate" />
                  </DialogButton>
                </div>
              </>
            );
          })}
      </Focusable>
      <ButtonItem
        layout="below"
        onClick={() => {
          closeModal();
        }}
      >
        Close
      </ButtonItem>
    </>
  );
}
