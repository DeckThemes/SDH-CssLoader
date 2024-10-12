import { ButtonItem, PanelSectionRow } from "@decky/ui";
import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";

export function QamRefreshButton() {
  const reloadPlugin = useCSSLoaderAction("reloadPlugin");
  const isWorking = useCSSLoaderValue("isWorking");
  return (
    <PanelSectionRow>
      <ButtonItem
        disabled={isWorking}
        onClick={() => {
          console.log("TEST");
          void reloadPlugin();
        }}
        layout="below"
      >
        Refresh
      </ButtonItem>
    </PanelSectionRow>
  );
}
