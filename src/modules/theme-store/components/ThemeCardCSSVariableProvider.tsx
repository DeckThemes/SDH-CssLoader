import { themeCardStylesGenerator } from "@/styles";
import { useThemeBrowserSharedValue } from "../context";

export function ThemeCardCSSVariableProvider() {
  const browserCardSize = useThemeBrowserSharedValue("browserCardSize");

  return <style>{themeCardStylesGenerator(browserCardSize)}</style>;
}
