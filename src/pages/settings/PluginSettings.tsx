import { Focusable, ToggleField } from "decky-frontend-lib";
import { useMemo, useState, useEffect } from "react";
import { useCssLoaderState } from "../../state";
import { storeWrite, toast } from "../../python";
import { setNavPatch } from "../../deckyPatches/NavPatch";
import {
  getWatchState,
  getServerState,
  enableServer,
  toggleWatchState,
  getBetaTranslationsState,
} from "../../backend/pythonMethods/pluginSettingsMethods";
import { booleanStoreWrite } from "../../backend/pythonMethods/storeUtils";

export function PluginSettings() {
  const { navPatchInstance } = useCssLoaderState();
  const [serverOn, setServerOn] = useState<boolean>(false);
  const [watchOn, setWatchOn] = useState<boolean>(false);
  const [betaTranslationsOn, setBetaTranslationsOn] = useState<boolean>(false);

  const navPatchEnabled = useMemo(() => !!navPatchInstance, [navPatchInstance]);

  async function fetchServerState() {
    const value = await getServerState();
    setServerOn(value);
  }
  async function fetchWatchState() {
    const value = await getWatchState();
    setWatchOn(value);
  }
  async function fetchBetaTranslationsState() {
    const value = await getBetaTranslationsState();
    setBetaTranslationsOn(value);
  }

  useEffect(() => {
    void fetchServerState();
    void fetchWatchState();
    void fetchBetaTranslationsState();
  }, []);

  async function setWatch(enabled: boolean) {
    await toggleWatchState(enabled, false);
    await fetchWatchState();
  }

  async function setServer(enabled: boolean) {
    if (enabled) await enableServer();
    await booleanStoreWrite("server", enabled);
    await fetchServerState();
  }

  async function setBetaTranslations(enabled: boolean) {
    await booleanStoreWrite("beta_translations", enabled);
    await fetchBetaTranslationsState();
    toast(
      "Beta translations " + (enabled ? "enabled" : "disabled") + ".",
      "Please restart Steam to apply changes."
    );
  }

  return (
    <div>
      <Focusable>
        <ToggleField
          checked={betaTranslationsOn}
          label="Enable Beta Branch CSS Translations"
          description="Enable this if you use Steam beta, as this will tell CSS Loader to use beta classnames"
          onChange={setBetaTranslations}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={serverOn}
          label="Enable Standalone Backend"
          description="Enables support for CSS Loader Desktop on Linux"
          onChange={(value) => {
            setServer(value);
          }}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={navPatchEnabled}
          label="Enable Nav Patch"
          description="Fixes issues with themes that attempt to hide elements of the UI"
          onChange={(value) => setNavPatch(value, true)}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={watchOn}
          label="Live CSS Editing"
          description="Watches ~/homebrew/themes for any changes and automatically re-injects CSS"
          onChange={setWatch}
        />
      </Focusable>
    </div>
  );
}
