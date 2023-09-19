import { Focusable, PanelSection } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Flags, Theme } from "../../ThemeTypes";
import { useState } from "react";
import { PresetSelectionDropdown } from "../../components";
import { FullscreenProfileEntry } from "../../components/ThemeSettings/FullscreenProfileEntry";
import { installTheme } from "../../api";
import * as python from "../../python";

export function PresetSettings() {
  const { localThemeList, setGlobalState, updateStatuses } = useCssLoaderState();

  const [isInstalling, setInstalling] = useState(false);

  async function handleUpdate(e: Theme) {
    setInstalling(true);
    await installTheme(e.id);
    // This just updates the updateStatuses arr to know that this theme now is up to date, no need to re-fetch the API to know that
    setGlobalState(
      "updateStatuses",
      updateStatuses.map((f) => (f[0] === e.id ? [e.id, "installed", false] : e))
    );
    setInstalling(false);
  }

  async function handleUninstall(listEntry: Theme) {
    setInstalling(true);
    await python.deleteTheme(listEntry.name);
    await python.reloadBackend();
    setInstalling(false);
  }

  return (
    <div className="CSSLoader_PanelSection_NoPadding_Parent">
      <PanelSection title="Profiles">
        <PresetSelectionDropdown />
        <Focusable
          style={{ display: "flex", flexDirection: "column", gap: "0.5em", padding: "0.5em 0" }}
        >
          {localThemeList
            .filter((e) => e.flags.includes(Flags.isPreset))
            .map((e) => (
              <FullscreenProfileEntry
                data={e}
                {...{ handleUninstall, isInstalling, handleUpdate }}
              />
            ))}
        </Focusable>
      </PanelSection>
    </div>
  );
}
