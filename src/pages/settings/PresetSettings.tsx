import { useEffect, useMemo, useState } from "react";
import { useCssLoaderState } from "../../state";
import { PartialCSSThemeInfo } from "../../apiTypes";
import { genericGET, installTheme, logInWithShortToken } from "../../api";
import * as python from "../../python";
import { PresetSelectionDropdown, UploadProfileModalRoot } from "../../components";
import { Flags, Theme } from "../../ThemeTypes";
import { DialogButton, Focusable, showModal } from "decky-frontend-lib";
import { FullscreenCloudProfileEntry } from "../../components/ThemeSettings/FullscreenCloudProfileEntry";
import { FullscreenProfileEntry } from "../../components/ThemeSettings/FullscreenProfileEntry";
import { PremiumFeatureModal } from "../../components/Modals/PremiumFeatureModal";

export function PresetSettings() {
  const { localThemeList, setGlobalState, updateStatuses } = useCssLoaderState();

  const [isInstalling, setInstalling] = useState(false);

  const { apiFullToken, apiShortToken, apiMeData } = useCssLoaderState();

  const [uploadedProfiles, setUploadedProfiles] = useState<
    (PartialCSSThemeInfo & { isPrivate?: boolean })[]
  >([]);

  const [profilesLoaded, setLoaded] = useState<boolean>(false);

  async function getUserProfiles() {
    setLoaded(false);
    if (!apiFullToken) {
      await logInWithShortToken();
    }

    // Since the short token could be invalid, we still have to re-check for if the log in actually worked.
    // The react value doesn't update mid function, so we re-grab it.
    const upToDateFullToken = python.globalState?.getGlobalState("apiFullToken");
    if (!upToDateFullToken) return;

    let profileArray: PartialCSSThemeInfo[] = [];
    const publicProfileData = await genericGET("/users/me/themes?filters=Profile", true);
    if (publicProfileData && publicProfileData.total > 0) {
      profileArray.push(...publicProfileData.items);
    }
    const privateProfileData = await genericGET("/users/me/themes/private?filters=Profile", true);
    if (privateProfileData && privateProfileData.total > 0) {
      profileArray.push(
        ...privateProfileData.items.map((e: PartialCSSThemeInfo) => ({ ...e, isPrivate: true }))
      );
    }
    profileArray.sort((a, b) => (a.name > b.name ? 1 : -1));
    setUploadedProfiles(profileArray);

    setLoaded(true);
  }

  useEffect(() => {
    if (apiShortToken) void getUserProfiles();
  }, []);

  type MergedCloudProfile = { isCloud: true; data: PartialCSSThemeInfo & { isPrivate: boolean } };
  type MergedNormalProfile = { isCloud: false; data: Theme };

  const mergedProfileList: (MergedCloudProfile | MergedNormalProfile)[] = useMemo(() => {
    const filteredLocalProfiles: MergedNormalProfile[] = localThemeList
      .filter((e) => e.flags.includes(Flags.isPreset))
      .filter((e) => {
        if (uploadedProfiles.some((f) => f.id === e.id)) return false;
        return true;
      })
      .map((e) => ({ isCloud: false, data: e }));

    const filteredCloudProfiles = uploadedProfiles.map((e) => ({
      isCloud: true,
      data: e,
    })) as MergedCloudProfile[];

    return [
      ...filteredLocalProfiles.sort((a, b) => (a.data.name > b.data.name ? 1 : -1)),
      ...filteredCloudProfiles.sort((a, b) => (a.data.name > b.data.name ? 1 : -1)),
    ];
  }, [uploadedProfiles, localThemeList]);

  function onUploadFinish() {
    void getUserProfiles();
  }

  async function handleUpdate(e: Theme | PartialCSSThemeInfo) {
    setInstalling(true);
    await installTheme(e.id);
    // This just updates the updateStatuses arr to know that this theme now is up to date, no need to re-fetch the API to know that
    setGlobalState(
      "updateStatuses",
      updateStatuses.map((f) => (f[0] === e.id ? [e.id, "installed", false] : f))
    );
    setInstalling(false);
  }

  async function handleUninstall(listEntry: Theme | PartialCSSThemeInfo) {
    setInstalling(true);
    await python.deleteTheme(listEntry.name);
    await python.reloadBackend();
    setGlobalState(
      "updateStatuses",
      updateStatuses.filter((f) => f[0] !== listEntry.id)
    );
    setInstalling(false);
  }

  return (
    <div className="CSSLoader_PanelSection_NoPadding_Parent">
      <PresetSelectionDropdown />
      <Focusable
        style={{ display: "flex", flexDirection: "column", gap: "0.5em", padding: "0.5em 0" }}
      >
        {mergedProfileList.map((e) => {
          if (e.isCloud) {
            return (
              <FullscreenCloudProfileEntry
                data={e.data}
                handleUninstall={handleUninstall}
                handleUpdate={handleUpdate}
                isInstalling={isInstalling}
              />
            );
          }
          return (
            <FullscreenProfileEntry
              data={e.data}
              handleUninstall={handleUninstall}
              handleUpdate={handleUpdate}
              isInstalling={isInstalling}
            />
          );
        })}
      </Focusable>
      <Focusable>
        {apiMeData ? (
          <>
            <DialogButton
              style={{
                width: "fit-content",
                opacity: apiMeData.premiumTier && apiMeData.premiumTier !== "None" ? "100%" : "50%",
              }}
              onClick={() => {
                if (apiMeData.premiumTier && apiMeData.premiumTier !== "None") {
                  showModal(<UploadProfileModalRoot onUploadFinish={onUploadFinish} />);
                  return;
                }
                showModal(
                  <PremiumFeatureModal blurb="Since syncing profiles from your Deck to DeckThemes servers uses up storage, this feature is for those who support us on Patreon and help pay the bills." />
                );
                return;
              }}
            >
              Upload Profile
            </DialogButton>
          </>
        ) : (
          <>
            {apiShortToken ? (
              <span>Loading</span>
            ) : (
              <span>
                You are not logged in. Log In with your DeckThemes account to view your uploaded
                profiles.
              </span>
            )}
          </>
        )}
      </Focusable>
    </div>
  );
}
