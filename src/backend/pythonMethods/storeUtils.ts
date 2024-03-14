import { server, toast } from "../../python";

export async function booleanStoreRead(key: string) {
  const deckyRes = await server!.callPluginMethod<{ key: string }, string>("store_read", {
    key,
  });
  if (!deckyRes.success) {
    toast(`Error fetching ${key}`, deckyRes.result);
    return false;
  }
  return deckyRes.result === "1" || deckyRes.result === "true";
}

export async function booleanStoreWrite(key: string, value: boolean) {
  const deckyRes = await server!.callPluginMethod<{ key: string; val: string }>("store_write", {
    key,
    val: value ? "1" : "0",
  });
  if (!deckyRes.success) {
    toast(`Error fetching ${key}`, deckyRes.result);
  }
}
