import {
  CSSLoaderStateActions,
  CSSLoaderStateValues,
  ICSSLoaderState,
  createCSSLoaderStore,
} from "@cssloader/backend";
import { backend } from "./decky-backend-service";
import { useStore } from "zustand";

export const cssLoaderStore = createCSSLoaderStore(backend);

const useCSSLoaderStore = (fn: (state: ICSSLoaderState) => any) => useStore(cssLoaderStore, fn);

export const useCSSLoaderValue = <T extends keyof CSSLoaderStateValues>(
  key: T
): ICSSLoaderState[T] => useCSSLoaderStore((state) => state[key]);

export const useCSSLoaderAction = <T extends keyof CSSLoaderStateActions>(
  key: T
): ICSSLoaderState[T] => useCSSLoaderStore((state) => state[key]);

const useCSSLoaderStoreSetter =
  <T extends keyof ICSSLoaderState>(key: T) =>
  (value: ICSSLoaderState[T]) =>
    cssLoaderStore.setState((state) => ({ ...state, [key]: value }));

export const getCSSLoaderState = () => cssLoaderStore.getState();
export const setCSSLoaderState = <T extends keyof ICSSLoaderState>(
  key: T,
  value: ICSSLoaderState[T]
) => cssLoaderStore.setState({ [key]: value });
