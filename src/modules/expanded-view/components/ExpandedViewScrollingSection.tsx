import { ScrollPanelGroup } from "@decky/ui";
import { useExpandedViewAction } from "../context";

export function ExpandedViewScrollingSection() {
  const close = useExpandedViewAction("close");
  return (
    <ScrollPanelGroup
      // @ts-ignore
      classname="cl_expandedview_scrollcontainer"
      focusable={false}
      // onCancelButton doesn't work here
      onCancelActionDescription="Back"
      onButtonDown={(evt: any) => {
        if (!evt?.detail?.button) return;
        if (evt.detail.button === 2) {
          close();
        }
      }}
    ></ScrollPanelGroup>
  );
}
