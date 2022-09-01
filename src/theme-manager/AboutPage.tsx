import { VFC } from "react";

export const AboutPage: VFC = () => {
  return (
    // The outermost div is to push the content down into the visible area
    <div>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
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
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Support
      </h2>
      <span>
        See the Steam Deck Homebrew Discord server for support.
        <br />
        discord.gg/ZU74G2NJzk
      </span>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Create and Submit Your Own Theme
      </h2>
      <span>
        Instructions for theme creation/submission are available on the
        database's GitHub page.
        <br />
        github.com/suchmememanyskill/CssLoader-ThemeDb
      </span>
    </div>
  );
};
