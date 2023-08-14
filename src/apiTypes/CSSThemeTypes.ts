import { Url } from "url";
import { APIBlob } from "./BlobTypes";

export interface UserInfo {
  id: string;
  username: string;
  avatar: string;
}

export interface MinimalCSSThemeInfo {
  id: string;
  name: string;
  display_name: string;
  version: string;
  target: string;
  manifestVersion: number;
  specifiedAuthor: string;
  type: "Css" | "Audio";
}

export interface PartialCSSThemeInfo extends MinimalCSSThemeInfo {
  images: APIBlob[];
  download: APIBlob;
  author: UserInfo;
  submitted: Date;
  updated: Date;
  starCount: number;
}

export interface FullCSSThemeInfo extends PartialCSSThemeInfo {
  dependencies: MinimalCSSThemeInfo[];
  approved: boolean;
  disabled: boolean;
  description: string;
  source?: string;
}

export interface QueryResponseShell {
  total: number;
}

export interface ThemeQueryResponse extends QueryResponseShell {
  items: PartialCSSThemeInfo[];
}

export interface ThemeQueryRequest {
  page: number;
  perPage: number;
  filters: string;
  order: string;
  search: string;
}

export interface ThemeSubmissionQueryResponse extends QueryResponseShell {
  items: ThemeSubmissionInfo[];
}

export type SubmissionIntent = "NewTheme" | "UpdateTheme" | "UpdateMeta";
export enum FormattedSubmissionIntent {
  "NewTheme" = "New Theme",
  "UpdateTheme" = "Theme Update",
  "UpdateMeta" = "Theme Meta Update",
}
export type SubmissionStatus = "AwaitingApproval" | "Approved" | "Denied" | "Dead";
export enum FormattedSubmissionStatus {
  "AwaitingApproval" = "Awaiting Review",
  "Approved" = "Approved",
  "Denied" = "Denied",
  "Dead" = "Dead",
}

export interface ThemeSubmissionInfo {
  id: string;
  intent: SubmissionIntent;
  message: string | null;
  newTheme: FullCSSThemeInfo;
  oldTheme: MinimalCSSThemeInfo | null;
  owner: UserInfo;
  reviewedBy: UserInfo | null;
  status: SubmissionStatus;
  errors?: string[];
  submitted: Date;
}

export interface FilterQueryResponse {
  filters: string[];
  order: string[];
}
