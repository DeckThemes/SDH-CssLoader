import { DialogButton } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Theme } from "../../ThemeTypes";
import { BsFillCloudDownloadFill } from "react-icons/bs";

export function UpdateAllThemesButton({
  handleUpdate,
}: {
  handleUpdate: (entry: Theme) => Promise<void>;
}) {
  const { updateStatuses, localThemeList } = useCssLoaderState();

  async function updateAll() {
    const themesToBeUpdated = updateStatuses.filter((e) => e[1] === "outdated");
    for (let i = 0; i < themesToBeUpdated.length; i++) {
      const entry = localThemeList.find((f) => f.id === themesToBeUpdated[i][0]);
      if (!entry) break;
      await handleUpdate(entry);
    }
  }
  return (
    <>
      {updateStatuses.filter((e) => e[1] === "outdated").length > 0 && (
        <DialogButton className="CSSLoader_InstalledThemes_UpdateAllButton" onClick={updateAll}>
          <BsFillCloudDownloadFill />
          <span>Update All Themes</span>
        </DialogButton>
      )}
    </>
  );
}
