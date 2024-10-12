import { Patch } from "@decky/ui";
import type { Backend } from "@cssloader/backend";
import { createStore, useStore } from "zustand";
import { disableNavPatch, enableNavPatch } from "./nav-patch";
import { disableUnminifyMode, enableUnminifyMode } from "./unminify-mode";
import { backend } from "@/backend";

interface DeckyPatchStoreValues {
  unminifyModeOn: boolean;
  navPatchInstance: Patch | undefined;
}
interface DeckyPatchStoreActions {
  initializeStore: () => Promise<void>;
  deactivate: () => Promise<void>;
  setNavPatchState: (value: boolean, shouldToast?: boolean) => void;
  setUnminifyModeState: (value: boolean, shouldToast?: boolean) => void;
}

export interface IDeckyPatchState extends DeckyPatchStoreActions, DeckyPatchStoreValues {}

const createDeckyPatchStore = (backend: Backend) =>
  createStore<IDeckyPatchState>((set, get) => ({
    unminifyModeOn: false,
    navPatchInstance: undefined,
    initializeStore: async () => {
      try {
        const shouldEnable = await backend.storeRead("enableNavPatch");
        return;
        if (shouldEnable) {
          const patch = enableNavPatch();
          set({ navPatchInstance: patch });
        }
      } catch (error) {}
    },
    deactivate: async () => {
      const { navPatchInstance, unminifyModeOn } = get();
      if (navPatchInstance) {
        disableNavPatch(navPatchInstance);
        set({ navPatchInstance: undefined });
      }
      if (unminifyModeOn) {
        disableUnminifyMode();
      }
    },
    setNavPatchState: (enabled: boolean, shouldToast: boolean = false) => {
      const { navPatchInstance } = get();
      if (enabled) {
        // Don't Patch Twice
        if (!navPatchInstance) {
          const patch = enableNavPatch();
          set({ navPatchInstance: patch });
        }
      } else {
        disableNavPatch(navPatchInstance);
        set({ navPatchInstance: undefined });
      }
      shouldToast && backend.toast("Nav Patch", enabled ? "Enabled" : "Disabled");
      backend.storeWrite("enableNavPatch", enabled + "");
    },
    setUnminifyModeState: (enabled: boolean, shouldToast: boolean = false) => {
      if (enabled) {
        enableUnminifyMode();
      } else {
        disableUnminifyMode();
      }
      shouldToast && backend.toast("Unminify Mode", enabled ? "Enabled" : "Disabled");
    },
  }));

const deckyPatchState = createDeckyPatchStore(backend);

export const getDeckyPatchState = () => deckyPatchState.getState();

const useDeckyPatchState = (fn: (state: IDeckyPatchState) => any) => useStore(deckyPatchState, fn);

export const useDeckyPatchStateValue = <T extends keyof DeckyPatchStoreValues>(
  key: T
): IDeckyPatchState[T] => useDeckyPatchState((state) => state[key]);

export const useDeckyPatchStateAction = <T extends keyof DeckyPatchStoreActions>(
  key: T
): IDeckyPatchState[T] => useDeckyPatchState((state) => state[key]);
