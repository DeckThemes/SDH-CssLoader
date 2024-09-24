import { saveMappings } from "../python";

export async function dumpMappings() {
  try {
    if (!window.DFL) return;
    const map = window.DFL.classModuleMap as Map;
    if (!map) return;
    const jsonStr = JSON.stringify(Object.fromEntries(map));

    await saveMappings(jsonStr);
  } catch (error) {
    console.error("ERROR SAVING MAPPINGS", error);
  }
}
