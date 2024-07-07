import { Focusable } from "@decky/ui";
import { useThemeBrowserStoreAction, useThemeBrowserStoreValue } from "../context";
import { BrowserSearchFields } from "./BrowserSearchFields";
import { useCSSLoaderStateValue } from "@/backend";
import { ThemeCard } from "./ThemeCard";
import { useEffect, useRef } from "react";

export function ThemeBrowserPage() {
  const initializeStore = useThemeBrowserStoreAction("initializeStore");
  const themes = useThemeBrowserStoreValue("themes");
  const indexToSnapToOnLoad = useThemeBrowserStoreValue("indexToSnapToOnLoad");
  const backendVersion = useCSSLoaderStateValue("backendVersion");

  const endOfPageRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void initializeStore();
  }, []);

  return (
    <>
      <BrowserSearchFields />
      <Focusable className="flex flex-wrap justify-center gap-3">
        {themes.items
          .filter((theme) => theme.manifestVersion <= backendVersion)
          .map((theme, index) => (
            <ThemeCard
              ref={
                index === indexToSnapToOnLoad
                  ? endOfPageRef
                  : index === 0
                  ? firstCardRef
                  : undefined
              }
              key={theme.id}
              theme={theme}
            />
          ))}
      </Focusable>
    </>
  );
}
