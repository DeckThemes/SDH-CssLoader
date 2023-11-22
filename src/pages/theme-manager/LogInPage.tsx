import { DialogButton, Focusable, TextField, ToggleField } from "decky-frontend-lib";
import { SiWebauthn } from "react-icons/si";
import { useEffect, useMemo, useState, VFC } from "react";
import { logInWithShortToken, logOut } from "../../api";
import { useCssLoaderState } from "../../state";
import { enableServer, getServerState, storeWrite } from "../../python";
import { disableNavPatch, enableNavPatch } from "../../deckyPatches/NavPatch";
import { FaArrowRightToBracket } from "react-icons/fa6";

export const LogInPage: VFC = () => {
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
            <span style={{ fontWeight: "bold", fontSize: "2em" }}>Log In</span>
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
                  <span>Loading...</span>
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
                <FaArrowRightToBracket style={{ height: "1.5em", width: "1.5em" }} />
                <span>Log In</span>
              </DialogButton>
            </Focusable>
          </>
        )}
        <p>
          Logging in gives you access to star themes, saving them to their own page where you can
          quickly find them.
          <br />
          Create an account on deckthemes.com and generate an account key on your profile page.
          <br />
        </p>
      </div>
    </div>
  );
};
