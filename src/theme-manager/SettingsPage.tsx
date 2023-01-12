import { DialogButton, Focusable, TextField } from "decky-frontend-lib";
import { SiWebauthn } from "react-icons/si";
import { useState, VFC } from "react";
import { logInWithShortToken, logOut } from "../api";
import { useCssLoaderState } from "../state";

export const SettingsPage: VFC = () => {
  const { apiShortToken, apiFullToken, apiMeData } = useCssLoaderState();
  const [shortTokenInterimValue, setShortTokenIntValue] = useState<string>(apiShortToken);

  return (
    // The outermost div is to push the content down into the visible area
    <div>
      <div>
        {apiFullToken ? (
          <h1 style={{ fontWeight: "bold", fontSize: "2em" }}>Your Account</h1>
        ) : (
          <h1 style={{ fontSize: "1em", fontWeight: "normal" }}>
            <span style={{ fontWeight: "bold", fontSize: "2em" }}>Log In</span> - Create an account
            on deckthemes.com and generate a deck token on your account page.
          </h1>
        )}
        {apiFullToken ? (
          <>
            <Focusable style={{ display: "flex", alignItems: "center" }}>
              <div style={{ minWidth: "65%", marginRight: "auto" }}>
                {apiMeData ? (
                  <>
                    <span>Logged In As {apiMeData.username}</span>
                  </>
                ) : (
                  <span>Logged In</span>
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
                <span>Unlink My Deck</span>
              </DialogButton>
            </Focusable>
          </>
        ) : (
          <>
            <Focusable style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ minWidth: "65%", marginRight: "auto" }}>
                <TextField
                  disabled={!!apiFullToken}
                  label="DeckThemes Account Key"
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
                <SiWebauthn style={{ height: "1.5em", width: "1.5em" }} />
                <span>Log In</span>
              </DialogButton>
            </Focusable>
          </>
        )}
      </div>
      <Focusable>
        <div>
          <h1 style={{ fontWeight: "bold", fontSize: "2em", marginBottom: "0px" }}>
            About CSSLoader
          </h1>
          <div style={{ display: "flex", gap: "4em", fontSize: "0.9em" }}>
            <div>
              <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>
                Developers
              </h2>
              <ul style={{ marginTop: "0px", marginBottom: "0px" }}>
                <li>
                  <span>SuchMeme - github.com/suchmememanyskill</span>
                </li>
                <li>
                  <span>EMERALD - github.com/EMERALD0874</span>
                </li>
                <li>
                  <span>Beebles - github.com/beebls</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>
                Support
              </h2>
              <span>
                See the DeckThemes Discord server for support.
                <br />
                discord.gg/HsU72Kfnpf
              </span>
            </div>
            <div>
              <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>
                Create and Submit Your Own Theme
              </h2>
              <span>
                Instructions for theme creation/submission are available DeckThemes' docs website.
                <br />
                docs.deckthemes.com
              </span>
            </div>
          </div>
        </div>
      </Focusable>
    </div>
  );
};
