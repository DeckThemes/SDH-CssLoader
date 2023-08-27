import { Focusable, PanelSection } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { useMemo, useState } from "react";
import { Flags, Theme } from "../../ThemeTypes";
import { FullscreenSingleThemeEntry } from "../../components/ThemeSettings/FullscreenSingleThemeEntry";
import { ThemeErrorCard } from "../../components/ThemeErrorCard";
import { installTheme } from "../../api";
import * as python from "../../python";

export function ThemeSettings() {
  const { localThemeList, unpinnedThemes, themeErrors, setGlobalState, updateStatuses } =
    useCssLoaderState();

  const [isInstalling, setInstalling] = useState(false);

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
    if (unpinnedThemes.includes(listEntry.id)) {
      // This isn't really pinning it, it's just removing its name from the unpinned list.
      python.pinTheme(listEntry.id);
    }
    await python.reloadBackend();
    setInstalling(false);
  }

  return (
    <div className="CSSLoader_PanelSection_NoPadding_Parent">
      <PanelSection title="Installed Themes">
        <Focusable style={{ display: "grid", gridTemplateColumns: "1fr", gridGap: "0.25em" }}>
          {sortedList.map((e) => (
            <FullscreenSingleThemeEntry
              data={e}
              showModalButtonPrompt
              {...{ handleUpdate, handleUninstall, isInstalling }}
            />
          ))}
        </Focusable>
      </PanelSection>
      {themeErrors.length > 0 && (
        <PanelSection title="Errors">
          <Focusable
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: "1em" }}
          >
            {themeErrors.map((e) => {
              return <ThemeErrorCard errorData={e} />;
            })}
          </Focusable>
        </PanelSection>
      )}
    </div>
  );
}
