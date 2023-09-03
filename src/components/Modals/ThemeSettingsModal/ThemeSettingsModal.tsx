import { useState, useEffect, useMemo } from "react";

import { DialogButton, Focusable, ModalRoot, Toggle } from "decky-frontend-lib";
import { CssLoaderContextProvider, useCssLoaderState } from "../../../state";
import { Theme } from "../../../ThemeTypes";
import { globalState } from "../../../python";
import { ThemeSettingsModalButtons } from "./ThemeSettingsModalButtons";
import { toggleTheme } from "../../../backend/backendHelpers/toggleTheme";
import { ThemePatch } from "../../ThemePatch";
export function ThemeSettingsModalRoot({
  closeModal,
  selectedTheme,
}: {
  closeModal?: any;
  selectedTheme: string;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      {/* @ts-ignore */}
      <CssLoaderContextProvider cssLoaderStateClass={globalState}>
        <ThemeSettingsModal closeModal={closeModal} selectedTheme={selectedTheme} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

function ThemeSettingsModal({
  closeModal,
  selectedTheme,
}: {
  closeModal: any;
  selectedTheme: string;
}) {
  const { localThemeList, updateStatuses } = useCssLoaderState();
  const [themeData, setThemeData] = useState<Theme | undefined>(
    localThemeList.find((e) => e.id === selectedTheme)
  );

  useEffect(() => {
    setThemeData(localThemeList.find((e) => e.id === selectedTheme));
    return () => {
      setThemeData(undefined);
    };
  }, [selectedTheme, localThemeList]);

  return (
    <>
      <style>
        {`
      .CSSLoader_ThemeSettingsModal_ToggleParent {
        width: 90%;
      }
      
      .CSSLoader_ThemeSettingsModal_Title {
        font-weight: bold;
        font-size: 2em;
      }

      .CSSLoader_ThemeSettingsModal_Subtitle {
        font-size: 0.75em;
      }
    
      .CSSLoader_ThemeSettingsModal_Container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
        width: 100%;
      }
      
      .CSSLoader_ThemeSettingsModal_ButtonsContainer {
        display: flex;
        gap: 0.25em;
      }
      
      .CSSLoader_ThemeSettingsModalHeader_DialogButton {
        width: fit-content !important;
        min-width: fit-content !important;
        height: fit-content !important;
        padding: 10px 12px !important;
      }
      
      .CSSLoader_ThemeSettingsModal_IconTranslate {
        transform: translate(0px, 2px);
      }

      .CSSLoader_ThemeSettingsModal_Footer {
        display: flex;
        width: 100%;
        justify-content: space-between;
      }
      
      .CSSLoader_ThemeSettingsModal_TitleContainer {
        display: flex;
        max-width: 80%;
        flex-direction: column;
      }

      .CSSLoader_ThemeSettingsModal_Header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .CSSLoader_ThemeSettingsModal_PatchContainer {
        display: flex;
        width: 100%;
        flex-direction: column;
      }

      .CSSLoader_ThemeSettingsModal_UpdateButton {
        display: flex !important;
        gap: 0.25em;
      }

      .CSSLoader_ThemeSettingsModal_UpdateText {
        font-size: 0.75em;
      }
      `}
      </style>
      <Focusable className="CSSLoader_ThemeSettingsModal_Container">
        {themeData ? (
          <>
            <Focusable className="CSSLoader_ThemeSettingsModal_Header">
              <div className="CSSLoader_ThemeSettingsModal_TitleContainer">
                <span className="CSSLoader_ThemeSettingsModal_Title">{themeData.name}</span>
                <span className="CSSLoader_ThemeSettingsModal_Subtitle">
                  {themeData.version} | {themeData.author}
                </span>
              </div>
              <Toggle
                value={themeData.enabled}
                onChange={(checked) => {
                  toggleTheme(themeData, checked);
                }}
              />
            </Focusable>
            {themeData.enabled && themeData.patches.length > 0 && (
              <>
                <Focusable className="CSSLoader_ThemeSettingsModal_PatchContainer">
                  {themeData.patches.map((x, i, arr) => (
                    <ThemePatch data={x} index={i} fullArr={arr} themeName={themeData.name} />
                  ))}
                </Focusable>
              </>
            )}
          </>
        ) : (
          <span>No Theme Data</span>
        )}
        <Focusable className="CSSLoader_ThemeSettingsModal_Footer">
          <DialogButton
            style={{ width: "fit-content" }}
            onClick={() => {
              closeModal();
            }}
          >
            Close
          </DialogButton>
          {themeData && <ThemeSettingsModalButtons themeData={themeData} closeModal={closeModal} />}
        </Focusable>
      </Focusable>
    </>
  );
}
