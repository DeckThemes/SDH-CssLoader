import { MinimalCSSThemeInfo } from "./ThemeQueryTypes";

export interface Theme {
  id: string;
  enabled: boolean; // used to be called checked
  name: string;
  display_name: string;
  author: string;
  bundled: boolean; // deprecated
  require: number;
  version: string;
  patches: Patch[];
  dependencies: string[];
  flags: Flags[];
}

export interface ThemePatchComponent {
  name: string;
  on: string;
  type: string;
  value: string;
}

export interface Patch {
  default: string;
  name: string;
  type: "dropdown" | "checkbox" | "slider" | "none";
  value: string;
  options: string[];
  components: ThemePatchComponent[];
}

export enum Flags {
  "isPreset" = "PRESET",
  "dontDisableDeps" = "KEEP_DEPENDENCIES",
  "optionalDeps" = "OPTIONAL_DEPENDENCIES",
  "navPatch" = "REQUIRE_NAV_PATCH",
}

export type LocalThemeStatus = "installed" | "outdated" | "local";
export type UpdateStatus = [string, LocalThemeStatus, false | MinimalCSSThemeInfo];

type ThemeErrorTitle = string;
type ThemeErrorDescription = string;
export type ThemeError = [ThemeErrorTitle, ThemeErrorDescription];
