import { useCSSLoaderStateValue } from "@/backend";
import { PanelSectionRow } from "@decky/ui";

export function QamDummyFunctionBoundary({ children }: { children: React.ReactNode }) {
  const dummyFunctionResult = useCSSLoaderStateValue("dummyFunctionResult");

  if (!dummyFunctionResult) {
    return (
      <>
        <PanelSectionRow>
          <span>
            CSS Loader failed to initialize, try reloading, and if that doesn't work, try restarting
            your deck.
          </span>
        </PanelSectionRow>
      </>
    );
  }

  return <>{children}</>;
}
