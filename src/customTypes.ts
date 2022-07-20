export interface browseThemeEntry {
  author: string;
  download_url: string;
  id: string;
  name: string;
  preview_image: string;
  version: string;
}
export interface localThemeEntry {
  author: string;
  enabled: boolean;
  name: string;
  version?: string;
  patches?: object[];
}
