import { useState, useEffect } from "react";

import { DialogButton, ModalRoot } from "decky-frontend-lib";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "../state";
import { ThemeToggle } from "./ThemeToggle";
import { Theme } from "../ThemeTypes";
export function ThemeSettingsModalRoot({
  stateClass,
  closeModal,
  selectedTheme,
}: {
  stateClass: CssLoaderState;
  closeModal: any;
  selectedTheme: string;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <CssLoaderContextProvider cssLoaderStateClass={stateClass}>
        <ThemeSettingsModal closeModal={closeModal} selectedTheme={selectedTheme} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

export function ThemeSettingsModal({
  closeModal,
  selectedTheme,
}: {
  closeModal: any;
  selectedTheme: string;
}) {
  const { localThemeList } = useCssLoaderState();
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        {themeData ? (
          <div style={{ width: "90%" }}>
            <ThemeToggle data={themeData} collapsible={false} />
          </div>
        ) : (
          <span>No Theme Data</span>
        )}
        <DialogButton
          style={{ width: "fit-content" }}
          onClick={() => {
            closeModal();
          }}
        >
          Close
        </DialogButton>
      </div>
    </>
  );
}
