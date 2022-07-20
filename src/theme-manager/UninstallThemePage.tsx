import { PanelSectionRow, ButtonItem } from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaTrash } from "react-icons/fa";
import * as python from "../python";

import { useCssLoaderState } from "../state/CssLoaderState";
import { Theme } from "../theme";

export const UninstallThemePage: VFC = () => {
  const { localThemeList, setLocalThemeList } = useCssLoaderState();

  const [isUninstalling, setUninstalling] = useState(false);

  function handleUninstall(listEntry: Theme) {
    setUninstalling(true);
    python.resolve(python.deleteTheme(listEntry.data.name), () => {
      python.resolve(python.reset(), () => {
        python.resolve(python.getThemes(), setLocalThemeList);
        setUninstalling(false);
      });
    });
  }

  if (localThemeList.filter((e) => !e.data.bundled).length === 0) {
    return (
      <PanelSectionRow>
        <span>
          No custom themes installed, find some in the 'Browse Themes' tab.
        </span>
      </PanelSectionRow>
    );
  }

  return (
    <>
      {localThemeList
        .filter((e) => !e.data.bundled)
        .map((e: Theme) => (
          <PanelSectionRow>
            <ButtonItem
              label={e.data.name}
              onClick={() => handleUninstall(e)}
              disabled={isUninstalling}>
              <FaTrash />
            </ButtonItem>
          </PanelSectionRow>
        ))}
    </>
  );
};
