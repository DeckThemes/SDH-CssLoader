import {
  DialogButton,
  Focusable,
  Navigation,
  Panel,
  PanelSection,
  ScrollPanelGroup,
} from "decky-frontend-lib";
import { useEffect, useMemo, useState } from "react";
import { SiKofi, SiPatreon } from "react-icons/si";
import { server } from "../../python";

export function DonatePage() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [supporters, setSupporters] = useState<string>("");

  const formattedSupporters = useMemo(() => {
    const numOfNamesPerPage = 10;
    const supportersArr = supporters.split("\n");
    const newArr = [];
    for (let i = 0; i < supportersArr.length; i += numOfNamesPerPage) {
      newArr.push(supportersArr.slice(i, i + numOfNamesPerPage).join("\n"));
    }
    return newArr;
  }, [supporters]);

  function fetchSupData() {
    server!
      .fetchNoCors<any>("https://api.deckthemes.com/patrons", { method: "GET" })
      .then((deckyRes) => {
        if (deckyRes.success) {
          return deckyRes.result;
        }
        throw new Error("unsuccessful");
      })
      .then((res) => {
        if (res.status === 200) {
          return res.body;
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
        .link-header {
          font-size: 1.125em;
          margin-bottom: 0.5em;
        }
        .patreon-or-kofi-container ul {
          margin: 0;
          padding-left: 20px;
        }
        .support-methods-container {
          display: flex;
          gap: 1em;
        }
        .supporter-list-container {
          margin-top: 1em;
        }
        .supporter-list {
          white-space: pre-line;
          margin: 0;
        }
        `}
      </style>
      <p className="donation-spiel">
        Donations help to cover the costs of hosting the store, as well as funding development for
        CSS Loader and it's related projects.
      </p>
      <Focusable className="support-methods-container">
        <Focusable
          onActivate={() => Navigation.NavigateToExternalWeb("https://patreon.com/deckthemes")}
          focusWithinClassName="gpfocuswithin"
          className="patreon-or-kofi-container patreon"
        >
          <div className="method-title-container">
            <SiPatreon />
            <span className="method-title">Patreon</span>
          </div>
          <span className="method-subtitle">Recurring Donation</span>
          <span className="link-header">patreon.com/deckthemes</span>
          <span className="perks-header">Perks: </span>
          <ul>
            <li>
              {/* Potentially could expand this to add it to deckthemes and audioloader */}
              Your name in CSS Loader
            </li>
            <li>Patreon badge on deckthemes.com</li>
            <li>
              {/* Could also impl. this on deck store to make it more meaningful */}
              Colored name + VIP channel in the DeckThemes Discord
            </li>
          </ul>
        </Focusable>
        <Focusable
          onActivate={() => Navigation.NavigateToExternalWeb("https://ko-fi.com/suchmememanyskill")}
          focusWithinClassName="gpfocuswithin"
          className="patreon-or-kofi-container"
        >
          <div className="method-title-container">
            <SiKofi />
            <span className="method-title">Ko-Fi</span>
          </div>
          <span className="method-subtitle">One-time Donation</span>
          <span className="link-header">ko-fi.com/suchmememanyskill</span>
        </Focusable>
      </Focusable>
      {loaded ? (
        <div className="CSSLoader_PanelSection_NoPadding_Parent supporter-list-container">
          <PanelSection title="Patreon Supporters">
            {formattedSupporters.map((e) => {
              return (
                <Focusable onActivate={() => {}} focusWithinClassName="gpfocuswithin">
                  <p className="supporter-list">{e}</p>
                </Focusable>
              );
            })}
          </PanelSection>
        </div>
      ) : null}
    </div>
  );
}
