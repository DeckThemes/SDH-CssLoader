import { ImSpinner5 } from "react-icons/im";

export function ExpandedViewLoadingPage() {
  return (
    <>
      <div className="cl_fullscreenroute_container flex items-center justify-center gap-4">
        <ImSpinner5 className="cl_spinny" size={48} />
        <span className="cl_expandedview_loadingtext">Loading</span>
      </div>
    </>
  );
}
