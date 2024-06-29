import { PartialCSSThemeInfo } from "@/types";
import { useThemeBrowserSharedStateValue } from "../context";
import { forwardRef } from "react";

interface ThemeCardProps {
  theme: PartialCSSThemeInfo;
  size?: number;
}

export const ThemeCard = forwardRef<HTMLElement, ThemeCardProps>(({ theme, size }, ref) => {
  const browserCardSize = useThemeBrowserSharedStateValue("browserCardSize");
  const cols = size ?? browserCardSize;

  return null;
});
