import { Theme, UpdateStatus } from "../ThemeTypes";
import { genericGET } from "../api";
import { MinimalCSSThemeInfo } from "../apiTypes";
import { globalState } from "../python";
const apiUrl = "https://api.deckthemes.com";

async function fetchThemeIDS(idsToQuery: string[]): Promise<MinimalCSSThemeInfo[]> {
  const queryStr = "?ids=" + idsToQuery.join(".");
  return genericGET(`/themes/ids${queryStr}`)
    .then((data) => {
      if (data) return data;
      return [];
    })
    .catch((err) => {
      console.error("Error Fetching Theme Updates!", err);
      return [];
    });
}

export async function bulkThemeUpdateCheck() {
  const { localThemeList } = globalState!.getPublicState();
  let idsToQuery: string[] = localThemeList.map((e) => e.id);

  if (idsToQuery.length === 0) return [];

  const themeArr = await fetchThemeIDS(idsToQuery);

  if (themeArr.length === 0) return [];

  const updateStatusArr: UpdateStatus[] = localThemeList.map((localEntry) => {
    const remoteEntry = themeArr.find(
      (remote) => remote.id === localEntry.id || remote.name === localEntry.id
    );
    if (!remoteEntry) return [localEntry.id, "local", false];
    if (remoteEntry.version === localEntry.version)
      return [localEntry.id, "installed", remoteEntry];
    return [localEntry.id, "outdated", remoteEntry];
  });

  return updateStatusArr;
}
