import { DialogButton, ToggleField, showModal } from "decky-frontend-lib";
import { Flags, Theme } from "../../ThemeTypes";
import { CssLoaderState, useCssLoaderState } from "../../state";
import * as python from "../../python";
import { ImCog } from "react-icons/im";
import { AiFillEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ThemeSettingsModalRoot } from "./ThemeSettingsModal";
import { toggleTheme } from "../../backend/backendHelpers/toggleTheme";

export function AllThemesSingleEntry({ data: e }: { data: Theme }) {
  const { unpinnedThemes } = useCssLoaderState();
  const isPinned = !unpinnedThemes.includes(e.id);
  return (
    <>
      <div className="CSSLoader_FullTheme_EntryContainer">
        <div className="CSSLoader_FullTheme_ToggleContainer">
          <ToggleField
            bottomSeparator="none"
            label={<span className="CSSLoader_FullTheme_ThemeLabel">{e.display_name}</span>}
            checked={e.enabled}
            onChange={(switchValue: boolean) => {
              toggleTheme(e, switchValue);
            }}
          />
        </div>
        <DialogButton
          className="CSSLoader_FullTheme_DialogButton"
          onClick={() => {
            if (isPinned) {
              python.unpinTheme(e.id);
            } else {
              python.pinTheme(e.id);
            }
          }}
        >
          {isPinned ? (
            <AiFillEye className="CSSLoader_FullTheme_IconTranslate" />
          ) : (
            <AiOutlineEyeInvisible className="CSSLoader_FullTheme_IconTranslate" />
          )}
        </DialogButton>
        <DialogButton
          className="CSSLoader_FullTheme_DialogButton"
          onClick={() => {
            showModal(
              // @ts-ignore
              <ThemeSettingsModalRoot selectedTheme={e.id} />
            );
          }}
        >
          <ImCog className="CSSLoader_FullTheme_IconTranslate" />
        </DialogButton>
      </div>
    </>
  );
}
