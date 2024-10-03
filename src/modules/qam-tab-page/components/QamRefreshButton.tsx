import { ButtonItem, PanelSectionRow } from "@decky/ui";
import { useCSSLoaderAction } from "@/backend";

export function QamRefreshButton() {
  const reloadPlugin = useCSSLoaderAction("reloadPlugin");
  return (
    <PanelSectionRow>
      <ButtonItem
        onClick={() => {
          void reloadPlugin();
        }}
        layout="below"
      >
        Refresh
      </ButtonItem>
    </PanelSectionRow>
  );
}
