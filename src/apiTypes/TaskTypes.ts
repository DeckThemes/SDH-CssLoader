export interface TaskQueryResponse {
  id: string;
  name: string;
  status: string;
  completed: Date;
  started: Date;
  success: boolean;
}
