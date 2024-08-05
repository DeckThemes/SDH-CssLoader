import { ScrollPanelGroup } from "@decky/ui";
import { useExpandedViewAction, useExpandedViewValue } from "../context";
import { ExpandedViewImageContainer } from "./ExpandedViewImageContainer";

export function ExpandedViewScrollingSection() {
  const close = useExpandedViewAction("close");

  return (
    <ScrollPanelGroup
      // @ts-ignore
      className="cl_expandedview_scrollpanel"
      focusable={false}
      // onCancelButton doesn't work here
      onCancelActionDescription="Back"
      onButtonDown={(evt: any) => {
        if (!evt?.detail?.button) return;
        if (evt.detail.button === 2) {
          close();
        }
      }}
    >
      <div className="cl_expandedview_themedatacontainer">
        <ExpandedViewImageContainer />
      </div>
    </ScrollPanelGroup>
  );
}
