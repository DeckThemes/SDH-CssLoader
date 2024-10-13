import { cssLoaderStore, getCSSLoaderState } from "@/backend";
import { FullCSSThemeInfo } from "@/types";
import { Navigation } from "@decky/ui";
import { createStore, useStore } from "zustand";

interface IExpandedViewStoreValues {
  loaded: boolean;
  error: string | null;
  openedId: string | null;
  isStarred: boolean;
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
  toggleStar: () => Promise<void>;
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
    isStarred: false,
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
      const { apiFetch, apiFullToken } = getCSSLoaderState();
      try {
        const response = await apiFetch<FullCSSThemeInfo>(`/themes/${themeId}`);
        if (!response) {
          throw new Error("No response returned");
        }
        set({ data: response, loaded: true, focusedImageId: response.images[0]?.id || "" });
        setImageSizes();

        if (!apiFullToken) return;
        const starResponse = await apiFetch<{ starred: boolean }>(
          `/users/me/stars/${themeId}`,
          {},
          true
        );
        if (!starResponse) {
          // Silently error
          set({ isStarred: false });
        }
        set({ isStarred: starResponse.starred });
        // If you star and then quickly refresh, the API hasn't updated the cached starcount
        if (response.starCount === 0) {
          set({ data: { ...response, starCount: 1 } });
        }
      } catch (error) {
        set({ error: "Error fetching theme!", loaded: true });
        setImageSizes();
      }
    },
    toggleStar: async () => {
      try {
        const { data, isStarred } = get();
        const { apiFetch, apiFullToken } = getCSSLoaderState();
        if (!apiFullToken && !data.id) return;
        await apiFetch(`/users/me/stars/${data.id}`, {
          method: isStarred ? "DELETE" : "POST",
        });
        const newIsStarred = !isStarred;
        set({
          isStarred: newIsStarred,
          data: {
            ...data,
            starCount: newIsStarred
              ? data.starCount + 1
              : // If it was at 0 stars before (api hadn't updated, prevent it from going to -1)
              data.starCount === 0
              ? 0
              : data.starCount - 1,
          },
        });
      } catch (error) {
        // TODO: (potentially) handle error
      }
    },
    close: () => {
      set({
        loaded: false,
        isStarred: false,
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
