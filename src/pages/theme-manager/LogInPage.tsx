import { DialogButton, Focusable, TextField, ToggleField } from "decky-frontend-lib";
import { SiWebauthn } from "react-icons/si";
import { useEffect, useMemo, useState, VFC } from "react";
import { logInWithShortToken, logOut } from "../../api";
import { useCssLoaderState } from "../../state";
import { enableServer, getServerState, storeWrite } from "../../python";
import { disableNavPatch, enableNavPatch } from "../../deckyPatches/NavPatch";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { t } from "../../i18n";

export const LogInPage: VFC = () => {
  const { apiShortToken, apiFullToken, apiMeData } = useCssLoaderState();
  const [shortTokenInterimValue, setShortTokenIntValue] = useState<string>(apiShortToken);

  return (
    // The outermost div is to push the content down into the visible area
    <div>
      <div>
        {apiFullToken ? (
          <h1 style={{ fontWeight: "bold", fontSize: "2em" }}>{t("YOUR_ACCOUNT", "Your Account")}</h1>
        ) : (
          <h1 style={{ fontSize: "1em", fontWeight: "normal" }}>
            <span style={{ fontWeight: "bold", fontSize: "2em" }}>{t("LOG_IN", "Log In")}</span>
          </h1>
        )}
        {apiFullToken ? (
          <>
            <Focusable style={{ display: "flex", alignItems: "center" }}>
              <div style={{ minWidth: "65%", marginRight: "auto" }}>
                {apiMeData ? (
                  <>
                    <span>
                      {t("LOGGED_IN_AS", "Logged In As {username}", { username: apiMeData.username })}
                    </span>
                  </>
                ) : (
                  <span>{t("LOADING", "Loading...")}</span>
                )}
              </div>
              <DialogButton
                style={{
                  maxWidth: "30%",
                  height: "50%",
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5em",
                }}
                onClick={logOut}
              >
                <span>{t("UNLINK_DECK", "Unlink My Deck")}</span>
              </DialogButton>
            </Focusable>
          </>
        ) : (
          <>
            <Focusable style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ minWidth: "65%", marginRight: "auto" }}>
                <TextField
                  disabled={!!apiFullToken}
                  label={t("ACCOUNT_KEY_LABEL", "DeckThemes Account Key")}
                  bIsPassword
                  value={shortTokenInterimValue}
                  onChange={(e) => setShortTokenIntValue(e.target.value)}
                />
              </div>
              <DialogButton
                disabled={shortTokenInterimValue.length !== 12}
                onClick={() => {
                  logInWithShortToken(shortTokenInterimValue);
                }}
                style={{
                  maxWidth: "30%",
                  height: "50%",
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5em",
                }}
              >
                <FaArrowRightToBracket style={{ height: "1.5em", width: "1.5em" }} />
                <span>{t("LOG_IN", "Log In")}</span>
              </DialogButton>
            </Focusable>
          </>
        )}
        <p>
          {t(
            "LOGIN_PERKS_DESC",
            "Logging in gives you access to star themes, saving them to their own page where you can quickly find them."
          )}
          <br />
          {t(
            "LOGIN_CREATE_ACCOUNT_DESC",
            "Create an account on deckthemes.com and generate an account key on your profile page."
          )}
          <br />
        </p>
      </div>
    </div>
  );
};
