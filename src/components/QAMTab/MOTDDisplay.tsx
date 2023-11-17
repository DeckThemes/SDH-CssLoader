import { Focusable, PanelSection } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { Motd } from "../../apiTypes/Motd";
import { genericGET } from "../../api";

export function MOTDDisplay() {
  const [motd, setMotd] = useState<Motd | undefined>();
  useEffect(() => {
    async function getMotd() {
      const res = await genericGET("/motd", false);
      setMotd(res);
    }
    getMotd();
  }, []);

  const SEVERITIES = {
    High: {
      color: "#bb1414",
      text: "#fff",
    },
    Medium: {
      color: "#bbbb14",
      text: "#fff",
    },
    Low: {
      color: "#1488bb",
      text: "#fff",
    },
  };

  const severity = SEVERITIES[motd?.severity || "Low"];

  if (motd && motd?.name) {
    return (
      <PanelSection>
        <Focusable
          onActivate={() => {}}
          style={{
            // Transparency is 20% of the color
            backgroundColor: `${severity.color}33`,
            color: severity.text,
            borderColor: severity.color,
            borderWidth: "2px",
            borderStyle: "solid",
            padding: "0.75em",
            display: "flex",
            flexDirection: "column",
          }}
          focusWithinClassName="gpfocuswithin"
        >
          <span style={{ fontWeight: "bold" }}>{motd?.name}</span>
          <span style={{ fontSize: "0.75em" }}>{motd?.description}</span>
        </Focusable>
      </PanelSection>
    );
  }
  return null;
}
