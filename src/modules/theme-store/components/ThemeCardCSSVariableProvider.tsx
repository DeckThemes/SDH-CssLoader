import { themeCardStylesGenerator } from "@/styles";
import { useThemeBrowserSharedStateValue } from "../context";

export function ThemeCardCSSVariableProvider() {
  const browserCardSize = useThemeBrowserSharedStateValue("browserCardSize");

  return <style>{themeCardStylesGenerator(browserCardSize)}</style>;
}
