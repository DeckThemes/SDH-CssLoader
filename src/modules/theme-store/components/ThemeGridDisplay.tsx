import { Focusable } from "@decky/ui";
import { useThemeBrowserStoreValue } from "../context";
import { useCSSLoaderStateValue } from "@/backend";

export function ThemeGridDisplay() {
  const backendVersion = useCSSLoaderStateValue("backendVersion")
  const themes = useThemeBrowserStoreValue("themes");
  return <Focusable className="cl-store-theme-grid-container">
    {themes.items.filter((theme) => theme.manifestVersion <= backendVersion).map((theme, index) => (
      <
    ))}
  </Focusable>;
}
