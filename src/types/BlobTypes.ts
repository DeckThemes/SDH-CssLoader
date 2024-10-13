export type BlobType = "Zip" | "Jpg";

export interface APIBlob {
  id: string;
  blobType: BlobType;
  uploaded: Date;
  downloadCount: number;
}
