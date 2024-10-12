import { callable, toaster, fetchNoCors } from "@decky/api";
import { CallError, FetchError, type IBackendRepository } from "@cssloader/backend";

class DeckyBackendRepository implements IBackendRepository {
  async call<Args extends any[] = [], Return = void>(methodName: string, args: Args) {
    const func = callable<Args, Return>(methodName);
    try {
      return await func(...args);
    } catch (error: unknown) {
      throw new CallError(
        "Error Calling Backend",
        methodName,
        error instanceof Error ? error.message : "No Error Message Provided"
      );
    }
  }
  async fetch<Return>(url: string, request: RequestInit) {
    try {
      console.debug("CSSLOADER FETCH", url, request);
      // TODO: Think this is a decky types issue
      // @ts-ignore
      const res = await fetchNoCors(url, request);
      if (!res.ok) {
        throw new Error(`Res Not Okay - Code ${res.status}`);
      }
      return res.json() as Return;
    } catch (error: unknown) {
      throw new FetchError(
        "Error Fetching",
        url,
        error instanceof Error ? error.message : "No Error Message Provided"
      );
    }
  }
  toast(title: string, body?: string) {
    toaster.toast({ title: title, body: body ?? "", duration: 5000 });
  }
}

export default DeckyBackendRepository;
