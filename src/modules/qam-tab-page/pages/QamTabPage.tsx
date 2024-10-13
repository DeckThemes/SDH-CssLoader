import { PanelSection } from "@decky/ui";
import { MOTDDisplay, PresetSelectionDropdown } from "@/lib";
import {
  QamDummyFunctionBoundary,
  QamHiddenThemesDisplay,
  QamRefreshButton,
  QamThemeList,
} from "../components";
import { useCSSLoaderValue } from "@/backend";

export function QamTabPage() {
  const themes = useCSSLoaderValue("themes");

  return (
    <>
      <MOTDDisplay />
      <QamDummyFunctionBoundary>
        <PanelSection title="Themes">
          {themes.length > 0 && <PresetSelectionDropdown />}
          <QamThemeList />
          <QamHiddenThemesDisplay />
        </PanelSection>
      </QamDummyFunctionBoundary>
      <PanelSection>
        <QamRefreshButton />
      </PanelSection>
    </>
  );
}
