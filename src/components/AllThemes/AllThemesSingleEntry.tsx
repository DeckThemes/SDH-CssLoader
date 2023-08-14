import { DialogButton, ToggleField, showModal } from "decky-frontend-lib";
import { Flags, Theme } from "../../ThemeTypes";
import { CssLoaderState, useCssLoaderState } from "../../state";
import * as python from "../../python";
import { ImCog } from "react-icons/im";
import { AiFillEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ThemeSettingsModalRoot } from "./ThemeSettingsModal";

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
              // Actually enabling the theme
              python.resolve(python.setThemeState(e.name, switchValue), () => {
                python.getInstalledThemes();
              });
              // Dependency Toast
              if (e.dependencies.length > 0) {
                if (switchValue === true) {
                  python.toast(
                    `${e.display_name} enabled other themes`,
                    // This lists out the themes by name, but often overflowed off screen
                    // @ts-ignore
                    // `${new Intl.ListFormat().format(data.dependencies)} ${
                    //   data.dependencies.length > 1 ? "are" : "is"
                    // } required for this theme`
                    // This just gives the number of themes
                    `${
                      e.dependencies.length === 1
                        ? `1 other theme is required by ${e.display_name}`
                        : `${e.dependencies.length} other themes are required by ${e.display_name}`
                    }`
                  );
                  return;
                }
                if (!e.flags.includes(Flags.dontDisableDeps)) {
                  python.toast(
                    `${e.display_name} disabled other themes`,
                    // @ts-ignore
                    `${
                      e.dependencies.length === 1
                        ? `1 theme was originally enabled by ${e.display_name}`
                        : `${e.dependencies.length} themes were originally enabled by ${e.display_name}`
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
