import { Focusable } from "@decky/ui";
import {
  ExpandedViewLoadingPage,
  ExpandedViewCssVariables,
  ExpandedViewScrollingSection,
  ExpandedViewButtonsSection,
} from "../components";
import { useExpandedViewValue } from "../context";

export function ExpandedViewPage() {
  const loaded = useExpandedViewValue("loaded");
  const error = useExpandedViewValue("error");

  if (!loaded) return <ExpandedViewLoadingPage />;

  if (error) return <span>{error}</span>;

  return (
    <div className="cl_fullscreenroute_container">
      <ExpandedViewCssVariables />
      <Focusable className="cl_expandedview_container">
        <ExpandedViewScrollingSection />
        <ExpandedViewButtonsSection />
      </Focusable>
    </div>
  );
}
