export interface GitSubmissionInfo {
  url: string;
  commit: string;
  subfolder: string;
}

export interface CSSSubmissionInfo {
  name: string;
  css: string;
}

export interface ZipSubmissionInfo {
  blob: string;
}

export interface MetaInfo {
  imageBlobs: string[];
  // These need to be null if undefined to stop it from overwriting the theme.json, but that is handled in the actual POST call
  description: string;
  target: string;
}
