import { LocalThemeStatus, PartialCSSThemeInfo, Theme } from "@/types";
import { useCSSLoaderStateValue } from "@/backend";

export function useThemeInstallState(theme: Theme | PartialCSSThemeInfo): LocalThemeStatus {
  const updateStatuses = useCSSLoaderStateValue("updateStatuses");

  const status = updateStatuses.find((status) => status[0] === theme.id);
  if (status) {
    return status[1];
  }
  return "notinstalled";
}
