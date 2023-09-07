import { Focusable } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { SiKofi, SiPatreon } from "react-icons/si";
import { server } from "../../python";

export function DonatePage() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [supporters, setSupporters] = useState<string>("");
  function fetchSupData() {
    server!
      .fetchNoCors<Response>(
        "https://gist.githubusercontent.com/suchmememanyskill/5ee4ad408b08ee03ac370a4d6120510f/raw"
      )
      .then((res) => {
        if (res.success) {
          return res.result;
        }
        throw new Error("Unsuccessful");
      })
      .then((res) => {
        console.log(res);
        if (res.ok) {
          return res.text();
        }
        throw new Error("Res not OK");
      })
      .then((text) => {
        if (text) {
          setLoaded(true);
          setSupporters(text);
        }
      })
      .catch((err) => {
        console.error("CSS Loader - Error Fetching Supporter Data", err);
      });
  }
  useEffect(() => {
    fetchSupData();
  }, []);
  return (
    <div>
      <style>
        {`
        .donation-spiel {
          margin-top: 0;
        }
        .patreon-or-kofi-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .method-title-container .method-title {
          font-size: 1.75em;
          font-weight: bold;
        }
        .method-title-container svg {
          font-size: 1.75em;
        }
        .method-title-container {
          display: flex;
          gap: 0.5em;
          align-items: center;
        }
        .method-subtitle {
          font-size: 1.25em;
          font-weight: bold;
        }
        .perks-header {
          font-size: 1.125em;
        }
        .patreon-or-kofi-container ul {
          margin: 0;
        }
        .support-methods-container {
          display: flex;
          gap: 1em;
        }
        `}
      </style>
      <p className="donation-spiel">
        Donations help to cover the costs of hosting the store, as well as funding development for
        CSS Loader and it's related projects.
        <br />
        We take donations through our Patreon and Ko-fi pages
      </p>
      <Focusable className="support-methods-container">
        <Focusable
          onActivate={() => {}}
          focusWithinClassName="gpfocuswithin"
          className="patreon-or-kofi-container patreon"
        >
          <div className="method-title-container">
            <SiPatreon />
            <span className="method-title">Patreon</span>
          </div>
          <span className="method-subtitle">Recurring Donation</span>
          <span className="perks-header">Perks: </span>
          <ul>
            <li>
              {/* Potentially could expand this to add it to deckthemes and audioloader */}
              Your name in CSS Loader.
            </li>
            <li>Patreon badge in the DeckThemes Discord server.</li>
            <li>
              {/* Could also impl. this on deck store to make it more meaningful */}
              Colored name on deckthemes.com
            </li>
            <li>Access to VIP support chats with the DeckThemes team.</li>
          </ul>
        </Focusable>
        <Focusable
          onActivate={() => {}}
          focusWithinClassName="gpfocuswithin"
          className="patreon-or-kofi-container"
        >
          <div className="method-title-container">
            <SiKofi />
            <span className="method-title">Ko-Fi</span>
          </div>
          <span className="method-subtitle">One-time Donation</span>
          <span className="perks-header">Perks: </span>
          <li>
            {/* we should somehow clarify that it lasts 6 months, maybe through an asterisk */}
            Your name in CSS Loader.
          </li>
        </Focusable>
      </Focusable>
      {loaded ? (
        <Focusable onActivate={() => {}} focusWithinClassName="gpfocuswithin">
          <p>{supporters}</p>
        </Focusable>
      ) : null}
    </div>
  );
}
