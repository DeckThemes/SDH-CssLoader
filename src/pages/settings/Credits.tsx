import { t } from "../../i18n";

export function Credits() {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: "0.9em" }}>
        <div>
          <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>{t("CREDITS_DEVELOPERS", "Developers")}</h2>
          <ul style={{ marginTop: "0px", marginBottom: "0px" }}>
            <li>
              <span>SuchMeme - github.com/suchmememanyskill</span>
            </li>
            <li>
              <span>Beebles - github.com/beebls</span>
            </li>
            <li>
              <span>EMERALD - github.com/EMERALD0874</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>{t("CREDITS_SUPPORT", "Support")}</h2>
          <span>
            {t("CREDITS_SUPPORT_DESC", "See the DeckThemes Discord server for support.")}
            <br />
            discord.gg/HsU72Kfnpf
          </span>
        </div>
        <div>
          <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>
            {t("CREDITS_SUBMIT", "Create and Submit Your Own Theme")}
          </h2>
          <span>
            {t("CREDITS_SUBMIT_DESC", "Instructions for theme creation/submission are available DeckThemes' docs website.")}
            <br />
            docs.deckthemes.com
          </span>
        </div>
      </div>
    </div>
  );
}
