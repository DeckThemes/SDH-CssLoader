export interface TaskQueryResponse {
  id: string;
  name: string;
  status: string;
  completed: Date;
  started: Date;
  success: boolean;
}

export interface ZipSubmitRequest {
  blob: string;
  description: string;
  privateSubmission: boolean;
  imageBlobs: string[];
  target?: string;
}
