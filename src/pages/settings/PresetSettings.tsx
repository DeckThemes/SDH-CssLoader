import { ButtonItem, DialogButton, Focusable, PanelSection, showModal } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { Flags, Theme } from "../../ThemeTypes";
import { useEffect, useState } from "react";
import {
  PresetSelectionDropdown,
  UploadProfileModalRoot,
  VariableSizeCard,
} from "../../components";
import { FullscreenProfileEntry } from "../../components/ThemeSettings/FullscreenProfileEntry";
import { genericGET, installTheme, logInWithShortToken } from "../../api";
import * as python from "../../python";
import { PartialCSSThemeInfo, ThemeQueryResponse } from "../../apiTypes";
import { ThemeBrowserCardStyles } from "../../components/Styles";
import { PremiumFeatureModal } from "../../components/Modals/PremiumFeatureModal";

export function PresetSettings() {
  const { localThemeList, setGlobalState, updateStatuses, apiShortToken, apiFullToken, apiMeData } =
    useCssLoaderState();

  const [isInstalling, setInstalling] = useState(false);

  async function handleUpdate(e: Theme) {
    setInstalling(true);
    await installTheme(e.id);
    // This just updates the updateStatuses arr to know that this theme now is up to date, no need to re-fetch the API to know that
    setGlobalState(
      "updateStatuses",
      updateStatuses.map((f) => (f[0] === e.id ? [e.id, "installed", false] : e))
    );
    setInstalling(false);
  }

  async function handleUninstall(listEntry: Theme) {
    setInstalling(true);
    await python.deleteTheme(listEntry.name);
    await python.reloadBackend();
    setInstalling(false);
  }

  return (
    <div className="CSSLoader_PanelSection_NoPadding_Parent">
      <PanelSection title="Profiles">
        <PresetSelectionDropdown />
        <Focusable
          style={{ display: "flex", flexDirection: "column", gap: "0.5em", padding: "0.5em 0" }}
        >
          {localThemeList
            .filter((e) => e.flags.includes(Flags.isPreset))
            .map((e) => (
              <FullscreenProfileEntry
                data={e}
                {...{ handleUninstall, isInstalling, handleUpdate }}
              />
            ))}
        </Focusable>
      </PanelSection>
      <PanelSection title="Your Uploaded Profiles">
        <UploadedProfilesDisplay />
      </PanelSection>
    </div>
  );
}

function UploadedProfilesDisplay() {
  const { apiFullToken, apiShortToken, apiMeData } = useCssLoaderState();

  const [publicProfiles, setPublicProfiles] = useState<PartialCSSThemeInfo[]>([]);
  const [privateProfiles, setPrivateProfiles] = useState<PartialCSSThemeInfo[]>([]);
  const [profilesLoaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    async function getUserProfiles() {
      if (!apiFullToken) {
        await logInWithShortToken();
      }

      // Since the short token could be invalid, we still have to re-check for if the log in actually worked.
      // The react value doesn't update mid function, so we re-grab it.
      const upToDateFullToken = python.globalState?.getGlobalState("apiFullToken");
      console.log("up to date token", upToDateFullToken);
      if (!upToDateFullToken) return;
      const publicProfileData = await genericGET("/users/me/themes?filters=", true);
      if (publicProfileData && publicProfileData.total > 0) {
        setPublicProfiles(publicProfileData.items);
      }
      const privateProfileData = await genericGET("/users/me/themes/private?filters=", true);
      if (privateProfileData && privateProfileData.total > 0) {
        setPrivateProfiles(privateProfileData.items);
      }
      setLoaded(true);
    }
    if (apiShortToken) getUserProfiles();
  }, []);

  if (!apiMeData) {
    return (
      <>
        {apiShortToken ? (
          <>
            <span>Loading</span>
          </>
        ) : (
          <>
            <span>
              You are not logged in. Log In with your DeckThemes account to view your uploaded
              profiles.
            </span>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <ThemeBrowserCardStyles customCardSize={5} />
      <Focusable style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        <DialogButton
          style={{
            width: "fit-content",
            opacity: apiMeData.premiumTier && apiMeData.premiumTier !== "None" ? "100%" : "50%",
            position: "absolute",
            top: "-2.6em",
            right: "0",
          }}
          onClick={() => {
            if (apiMeData.premiumTier && apiMeData.premiumTier !== "None") {
              showModal(<UploadProfileModalRoot />);
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
        {profilesLoaded ? (
          <>
            <Focusable style={{ display: "flex", flexDirection: "column" }}>
              {publicProfiles.length > 0 && (
                <>
                  <Focusable style={{ display: "flex", flexDirection: "column" }}>
                    <span>Public Profiles:</span>
                    <Focusable style={{ display: "flex", flexWrap: "wrap", gap: "1em" }}>
                      {publicProfiles.map((e) => (
                        <VariableSizeCard data={e} cols={5} onClick={() => {}} />
                      ))}
                    </Focusable>
                  </Focusable>
                </>
              )}
              {apiMeData.premiumTier &&
              apiMeData.premiumTier !== "None" &&
              privateProfiles.length > 0 ? (
                <>
                  <Focusable style={{ display: "flex", flexDirection: "column" }}>
                    <span>Private Profiles:</span>
                    <Focusable style={{ display: "flex", flexWrap: "wrap", gap: "1em" }}>
                      {privateProfiles.map((e) => (
                        <VariableSizeCard data={e} cols={5} onClick={() => {}} />
                      ))}
                    </Focusable>
                  </Focusable>
                </>
              ) : null}
            </Focusable>
          </>
        ) : (
          <span>Loading Profiles...</span>
        )}
      </Focusable>
    </>
  );
}
