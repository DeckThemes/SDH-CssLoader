import { StyleProvider, TitleView } from "@/lib";
import { RiPaintFill } from "react-icons/ri";
import { QamTabPage } from "@/modules/qam-tab-page";
import { definePlugin } from "@decky/api";
import { getCSSLoaderState } from "@/backend";
import { getDeckyPatchState } from "./decky-patches";

export default definePlugin(() => {
  getCSSLoaderState().initializeStore();
  getDeckyPatchState().initializeStore();

  return {
    titleView: (
      <StyleProvider>
        <TitleView />
      </StyleProvider>
    ),
    title: <div>CSSLoader</div>,
    icon: <RiPaintFill />,
    content: (
      <StyleProvider>
        <QamTabPage />
      </StyleProvider>
    ),
    alwaysRender: true,
    onDismount: () => {
      getCSSLoaderState().deactivate();
      getDeckyPatchState().deactivate();
    },
  };
});
