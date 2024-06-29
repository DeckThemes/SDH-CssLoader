import { Focusable } from "@decky/ui";
import { useCSSLoaderStateValue } from "../../../backend-impl/decky-theme-store";
import { Flags } from "@/types";
import { QamThemeToggle } from "./QamThemeToggle";

export function QamThemeList() {
  const themes = useCSSLoaderStateValue("themes");
  const unpinnedThemes = useCSSLoaderStateValue("unpinnedThemes");

  if (themes.length === 0) {
    return <span>You have no themes, visit the theme store to download some!</span>;
  }

  return (
    <Focusable className="flex flex-col items-stretch w-full">
      {themes
        .filter(
          (theme) => !unpinnedThemes.includes(theme.id) && !theme.flags.includes(Flags.isPreset)
        )
        .map((theme) => (
          <QamThemeToggle key={theme.name} theme={theme} />
        ))}
    </Focusable>
  );
}
