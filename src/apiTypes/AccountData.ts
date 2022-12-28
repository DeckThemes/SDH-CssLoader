import { Dispatch, SetStateAction } from "react";
import { PartialCSSThemeInfo, UserInfo } from "./CSSThemeTypes";

export enum Permissions {
  "editAny" = "EditAnyPost",
  "approveSubs" = "ApproveThemeSubmissions",
  "viewSubs" = "ViewThemeSubmissions",
  "admin" = "ManageApi",
}

export interface AccountData extends UserInfo {
  permissions: Permissions[];
}

export interface AuthContextContents {
  accountInfo: AccountData | undefined;
  setAccountInfo:
    | Dispatch<SetStateAction<AccountData | undefined>>
    | ((info: AccountData | undefined) => void);
}

export interface StarContextContents {
  starredThemes: StarredThemeList | undefined;
  setStarredThemes:
    | Dispatch<SetStateAction<StarredThemeList | undefined>>
    | ((info: StarredThemeList | undefined) => void);
}

export interface StarredThemeList {
  total: number;
  items: PartialCSSThemeInfo[];
}
