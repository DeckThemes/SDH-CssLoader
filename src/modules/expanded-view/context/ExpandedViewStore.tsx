import { getCSSLoaderState } from "@/backend";
import { FullCSSThemeInfo } from "@/types";
import { Navigation } from "@decky/ui";
import { createStore, useStore } from "zustand";

interface IExpandedViewStoreValues {
  loaded: boolean;
  error: string | null;
  openedId: string | null;
  data: FullCSSThemeInfo;
  focusedImageId: string;
  imageAreaStyleKeys: {
    imageAreaWidth: number;
    imageAreaPadding: number;
    gapBetweenCarouselAndImage: number;
    selectedImageWidth: number;
    selectedImageHeight: number;
    imageCarouselEntryWidth: number;
    imageCarouselEntryHeight: number;
  };
}

interface IExpandedViewStoreActions {
  openTheme: (themeId: string) => Promise<void>;
  downloadTheme: () => Promise<void>;
  setFocusedImage: (imageId: string) => void;
  close: () => void;
}

export interface IExpandedViewStore extends IExpandedViewStoreValues, IExpandedViewStoreActions {}

const expandedViewStore = createStore<IExpandedViewStore>((set, get) => {
  function setImageSizes() {
    const imageAreaWidth = 556;
    const imageAreaPadding = 16;
    const gapBetweenCarouselAndImage = 8;
    const selectedImageWidth =
      get().data?.images?.length > 1 ? 434.8 : imageAreaWidth - imageAreaPadding * 2;
    const selectedImageHeight = (selectedImageWidth / 16) * 10;
    const imageCarouselEntryWidth =
      imageAreaWidth - imageAreaPadding * 2 - selectedImageWidth - gapBetweenCarouselAndImage;
    set({
      imageAreaStyleKeys: {
        imageAreaWidth,
        imageAreaPadding,
        gapBetweenCarouselAndImage,
        selectedImageWidth,
        selectedImageHeight,
        imageCarouselEntryWidth,
        imageCarouselEntryHeight: (imageCarouselEntryWidth / 16) * 10,
      },
    });
  }
  return {
    loaded: false,
    openedId: null,
    data: {} as FullCSSThemeInfo,
    error: null,
    focusedImageId: "",
    imageAreaStyleKeys: {
      imageAreaWidth: 0,
      imageAreaPadding: 0,
      gapBetweenCarouselAndImage: 0,
      selectedImageWidth: 0,
      selectedImageHeight: 0,
      imageCarouselEntryWidth: 0,
      imageCarouselEntryHeight: 0,
    },
    openTheme: async (themeId) => {
      set({ loaded: false, error: null, openedId: themeId });
      Navigation.Navigate("/cssloader/expanded-view");
      const { apiFetch } = getCSSLoaderState();
      try {
        const response = await apiFetch<FullCSSThemeInfo>(`/themes/${themeId}`);
        if (response) {
          set({ data: response, loaded: true, focusedImageId: response.images[0]?.id || "" });
          setImageSizes();
          return;
        }
        throw new Error("No response returned");
      } catch (error) {
        set({ error: "Error fetching theme!", loaded: true });
        setImageSizes();
      }
    },
    downloadTheme: async () => {
      // const { apiFetch } = getCSSLoaderState();
      // try {
      //   await apiFetch(`/theme/${get().data.id}/download`, {}, true);
      // } catch (error) {
      //   set({ error: "Error downloading theme!" });
      // }
    },
    close: () => {
      set({
        loaded: false,
        openedId: null,
        data: {} as FullCSSThemeInfo,
        error: null,
        focusedImageId: "",
      });
      setImageSizes();
      Navigation.NavigateBack();
    },
    setFocusedImage: (imageId) => {
      set({ focusedImageId: imageId });
    },
  };
});

const useExpandedViewState = (fn: (state: IExpandedViewStore) => any) =>
  useStore(expandedViewStore, fn);

export const useExpandedViewValue = <T extends keyof IExpandedViewStoreValues>(
  key: T
): IExpandedViewStore[T] => useExpandedViewState((state) => state[key]);

export const useExpandedViewAction = <T extends keyof IExpandedViewStoreActions>(
  key: T
): IExpandedViewStore[T] => useExpandedViewState((state) => state[key]);
