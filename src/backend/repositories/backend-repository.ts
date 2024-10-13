export interface IBackendRepository {
  call: <Args extends any[] = [], Return = void>(methodName: string, args: Args) => Promise<Return>;
  toast: (title: string, body?: string) => void;
  fetch: <Return>(url: string, request: RequestInit) => Promise<Return>;
}
