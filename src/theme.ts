export interface Theme {
  id: string;
  enabled: boolean; // used to be called checked
  name: string;
  author: string;
  bundled: boolean; // deprecated
  require: number;
  version: string;
  patches: Patch[];
  dependencies: string[];
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
