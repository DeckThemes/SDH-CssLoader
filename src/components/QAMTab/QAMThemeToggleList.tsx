import {
  ButtonItem,
  Focusable,
  PanelSectionRow,
  gamepadDialogClasses,
  showModal,
} from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { ThemeToggle } from "../ThemeToggle";
import { AllThemesModalRoot } from "../AllThemes";
import { Flags } from "../../ThemeTypes";

export function QAMThemeToggleList() {
  const { localThemeList, unpinnedThemes } = useCssLoaderState();

  if (localThemeList.length === 0) {
    return (
      <>
        <span>You have no themes currently, click on "Download Themes" to download some!</span>
      </>
    );
  }

  return (
    <>
      {/* This styles the collapse buttons, putting it here just means it only needs to be rendered once instead of like 20 times */}
      <style>
        {`
        .CSSLoader_ThemeListContainer {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
        }
        /* PRE Aug 18th Beta */
        .CSSLoader_QAM_CollapseButton_Container > div > div > div > button {
          height: 10px !important;
        }
        /* POST Aug 18th Beta */
        .CSSLoader_QAM_CollapseButton_Container > div > div > div > div > button {
          height: 10px !important;
        }
        `}
      </style>
      <Focusable className="CSSLoader_ThemeListContainer">
        {unpinnedThemes.length === localThemeList.length ? (
          <>
            <span>
              You have no pinned themes currently, themes that you pin from the "Your Themes" popup
              will show up here
            </span>
          </>
        ) : (
          <>
            {localThemeList
              .filter((e) => !unpinnedThemes.includes(e.id) && !e.flags.includes(Flags.isPreset))
              .map((x) => (
                <ThemeToggle data={x} collapsible showModalButtonPrompt />
              ))}
          </>
        )}
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              // @ts-ignore
              showModal(<AllThemesModalRoot />);
            }}
          >
            Your Themes
          </ButtonItem>
        </PanelSectionRow>
      </Focusable>
    </>
  );
}
