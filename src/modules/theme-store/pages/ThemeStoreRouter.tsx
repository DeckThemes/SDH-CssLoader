import { Tabs } from "@decky/ui";
import { ThemeBrowserPage, ThemeCardCSSVariableProvider } from "../components";
import { ThemeBrowserStoreProvider } from "../context";
import { useState } from "react";

export function ThemeStoreRouter() {
  const [currentTab, setCurrentTab] = useState("allthemes");
  return (
    <div className="cl_fullscreenroute_container">
      <ThemeCardCSSVariableProvider />
      <Tabs
        activeTab={currentTab}
        onShowTab={(tab) => setCurrentTab(tab)}
        tabs={[
          {
            id: "allthemes",
            title: "All Themes",
            content: (
              <ThemeBrowserStoreProvider
                filterPath="/themes/filters"
                themePath="/themes"
                requiresAuth={false}
              >
                <ThemeBrowserPage />
              </ThemeBrowserStoreProvider>
            ),
          },
        ]}
      ></Tabs>
    </div>
  );
}
