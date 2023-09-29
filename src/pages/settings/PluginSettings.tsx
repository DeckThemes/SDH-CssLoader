import { Focusable, ToggleField } from "decky-frontend-lib";
import { useMemo, useState, useEffect } from "react";
import { useCssLoaderState } from "../../state";
import { storeWrite } from "../../python";
import { setNavPatch } from "../../deckyPatches/NavPatch";
import {
  getWatchState,
  getServerState,
  enableServer,
  toggleWatchState,
} from "../../backend/pythonMethods/pluginSettingsMethods";

export function PluginSettings() {
  const { navPatchInstance } = useCssLoaderState();
  const [serverOn, setServerOn] = useState<boolean>(false);
  const [watchOn, setWatchOn] = useState<boolean>(false);

  const navPatchEnabled = useMemo(() => !!navPatchInstance, [navPatchInstance]);

  useEffect(() => {
    getServerState().then((res) => {
      if (res.success) {
        setServerOn(res.result);
        return;
      }
      setServerOn(false);
    });
    getWatchState().then((res) => {
      if (res.success) {
        setWatchOn(res.result);
        return;
      }
      setWatchOn(false);
    });
  }, []);

  async function setWatch(enabled: boolean) {
    await toggleWatchState(enabled, false);
    const res = await getWatchState();
    if (res.success && res.result) setWatchOn(res.result);
  }

  async function setServer(enabled: boolean) {
    if (enabled) await enableServer();
    const res = await storeWrite("server", enabled ? "1" : "0");
    if (!res.success) return;
    const res2 = await getServerState();
    if (res2.success && res2.result) setServerOn(res2.result);
  }

  return (
    <div>
      <Focusable>
        <ToggleField
          checked={serverOn}
          label="Enable Standalone Backend"
          description="This needs to be enabled if you are using CSSLoader Desktop on Linux"
          onChange={(value) => {
            setServer(value);
          }}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={navPatchEnabled}
          label="Enable Nav Patch"
          description="This fixes issues with themes that attempt to hide elements of the UI"
          onChange={setNavPatch}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={watchOn}
          label="Live CSS Editing"
          description="CSS Loader will watch ~/homebrew/themes for any changes and will automatically re-inject CSS."
          onChange={setWatch}
        />
      </Focusable>
    </div>
  );
}
