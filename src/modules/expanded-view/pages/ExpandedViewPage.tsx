import { ExpandedViewLoadingPage, ExpandedViewScrollingSection } from "../components";
import { useExpandedViewValue } from "../context";

export function ExpandedViewPage() {
  const loaded = useExpandedViewValue("loaded");
  const error = useExpandedViewValue("error");

  if (!loaded) return <ExpandedViewLoadingPage />;

  if (error) return <span>{error}</span>;

  return (
    <div className="cl_expandedview_container">
      <ExpandedViewScrollingSection />
    </div>
  );
}
