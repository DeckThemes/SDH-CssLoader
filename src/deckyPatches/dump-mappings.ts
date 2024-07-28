import { saveMappings } from "../python";

export async function dumpMappings() {
  try {
    if (!window.DFL) return;
    const map = window.DFL.classModuleMap as Map;
    if (!map) return;
    const jsonStr = JSON.stringify(Object.fromEntries(map));

    const steamInfo = await SteamClient.System.GetSystemInfo();
    const version = String(steamInfo.nSteamVersion);

    await saveMappings(jsonStr, version);
  } catch (error) {
    console.error("ERROR SAVING MAPPINGS", error);
  }
}
