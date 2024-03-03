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
import { FaGlobe } from "react-icons/fa";

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
    const publicProfileData = await genericGET("/users/me/themes?filters=", true);
    if (publicProfileData && publicProfileData.total > 0) {
      profileArray.push(...publicProfileData.items);
    }
    const privateProfileData = await genericGET("/users/me/themes/private?filters=", true);
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

  function onUploadFinish() {
    void getUserProfiles();
  }

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
      <ThemeBrowserCardStyles customCardSize={4.5} />
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
        {profilesLoaded ? (
          <>
            {uploadedProfiles.length > 0 && (
              <>
                <Focusable
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5em", paddingTop: "1em" }}
                >
                  {uploadedProfiles.map((e) => (
                    <VariableSizeCard
                      data={e}
                      cols={4.5}
                      onClick={() => {}}
                      CustomBubbleIcon={
                        e.isPrivate ? null : (
                          <FaGlobe
                            style={{ fontSize: "0.9em" }}
                            className="CSSLoader_ThemeCard_BubbleIcon"
                          />
                        )
                      }
                    />
                  ))}
                </Focusable>
              </>
            )}
          </>
        ) : (
          <span>Loading Profiles...</span>
        )}
      </Focusable>
    </>
  );
}
