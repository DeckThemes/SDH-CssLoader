import { DropdownItem, Focusable, ToggleField } from "decky-frontend-lib";
import { useMemo, useState, useEffect } from "react";
import { useCssLoaderState } from "../../state";
import { toast } from "../../python";
import { setNavPatch } from "../../deckyPatches/NavPatch";
import {
  getWatchState,
  getServerState,
  enableServer,
  toggleWatchState,
  getBetaTranslationsState,
  fetchClassMappings,
} from "../../backend/pythonMethods/pluginSettingsMethods";
import { booleanStoreWrite, stringStoreWrite } from "../../backend/pythonMethods/storeUtils";
import { disableUnminifyMode, enableUnminifyMode } from "../../deckyPatches/UnminifyMode";

export function PluginSettings() {
  const { navPatchInstance, unminifyModeOn, setGlobalState } = useCssLoaderState();
  const [serverOn, setServerOn] = useState<boolean>(false);
  const [watchOn, setWatchOn] = useState<boolean>(false);
  const [betaTranslationsOn, setBetaTranslationsOn] = useState<string>("-1");

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
    if (!["0", "1", "-1"].includes(value)) {
      setBetaTranslationsOn("-1");
      return;
    }
    setBetaTranslationsOn(value);
  }

  useEffect(() => {
    void fetchServerState();
    void fetchWatchState();
    void fetchBetaTranslationsState();
  }, []);

  function setUnminify(enabled: boolean) {
    setGlobalState("unminifyModeOn", enabled);
    if (enabled) {
      enableUnminifyMode();
      return;
    }
    disableUnminifyMode();
  }

  async function setWatch(enabled: boolean) {
    await toggleWatchState(enabled, false);
    await fetchWatchState();
  }

  async function setServer(enabled: boolean) {
    if (enabled) await enableServer();
    await booleanStoreWrite("server", enabled);
    await fetchServerState();
  }

  async function setBetaTranslations(value: string) {
    await stringStoreWrite("beta_translations", value);
    await fetchClassMappings();
    await fetchBetaTranslationsState();
  }

  return (
    <div>
      <Focusable>
        <DropdownItem
          rgOptions={[
            { data: "-1", label: "Auto-Detect" },
            { data: "0", label: "Force Stable" },
            { data: "1", label: "Force Beta" },
          ]}
          selectedOption={betaTranslationsOn}
          label="SteamOS Branch"
          description="Choose the version of SteamOS you are on. This allows us to provide the correct translations for your system."
          onChange={(data) => setBetaTranslations(data.data)}
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
      <Focusable>
        <ToggleField
          checked={unminifyModeOn}
          label="Unminify Mode"
          description="Adds unminified classnames to devtools view, resets on steam client restart"
          onChange={setUnminify}
        />
      </Focusable>
    </div>
  );
}
