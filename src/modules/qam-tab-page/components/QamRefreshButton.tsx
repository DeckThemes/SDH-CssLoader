import { ButtonItem, PanelSectionRow } from "@decky/ui";
import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { useEffect, useRef } from "react";

export function QamRefreshButton() {
  const reloadPlugin = useCSSLoaderAction("reloadPlugin");
  const isWorking = useCSSLoaderValue("isWorking");

  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log(refreshButtonRef.current);
  });

  async function handleRefresh() {
    await reloadPlugin();
    // This just ensures focus isn't lost
    refreshButtonRef.current?.focus();
  }

  return (
    <PanelSectionRow>
      <ButtonItem
        // @ts-ignore Not typed currently
        ref={refreshButtonRef}
        disabled={isWorking}
        onClick={() => {
          void handleRefresh();
        }}
        layout="below"
      >
        Refresh
      </ButtonItem>
    </PanelSectionRow>
  );
}
