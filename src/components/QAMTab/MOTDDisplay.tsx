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

  function getColors() {
    switch (motd?.severity) {
      case "High":
        return { bg: "#c3010155", border: "#560d0d", text: "#fff" };
      case "Medium":
        return { bg: "rgba(255, 255, 0, 0.067)", border: "rgba(255, 255, 0, 0.467)", text: "#fff" };
      default:
        return { bg: "#3e72b055", border: "#6680a8", text: "#fff" };
    }
  }

  if (motd && motd?.name) {
    return (
      <PanelSection>
        <Focusable
          onActivate={() => {}}
          style={{
            backgroundColor: getColors().bg,
            color: getColors().text,
            borderColor: getColors().border,
            borderWidth: "0.25em",
            borderStyle: "solid",
            padding: "0.25em",
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
