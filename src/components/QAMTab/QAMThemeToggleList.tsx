import { Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { ThemeToggle } from "../ThemeToggle";
import { Flags } from "../../ThemeTypes";
import { ThemeErrorCard } from "../ThemeErrorCard";
import { BsArrowDown } from "react-icons/bs";

export function QAMThemeToggleList() {
  const { localThemeList, unpinnedThemes } = useCssLoaderState();

  if (localThemeList.length === 0) {
    return (
      <>
        <BsArrowDown
          style={{
            position: "absolute",
            right: "4.85em",
            transform: "rotate(180deg) scale(2) translateY(13px)",
          }}
        />
        <span>You have no themes currently, get started by clicking the download icon above!</span>
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
      </Focusable>
    </>
  );
}
