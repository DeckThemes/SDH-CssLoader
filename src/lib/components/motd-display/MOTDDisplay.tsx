import { DialogButton, Focusable, PanelSection } from "@decky/ui";
import { useEffect, useMemo } from "react";
import { Motd } from "@/types";
import { FaTimes } from "react-icons/fa";
import { useCSSLoaderAction, useCSSLoaderStateValue } from "@/backend";

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

export function MOTDDisplay() {
  const getMotd = useCSSLoaderAction("getMotd");
  const hideMotd = useCSSLoaderAction("hideMotd");
  const motd = useCSSLoaderStateValue("motd");
  const hiddenMotdId = useCSSLoaderStateValue("hiddenMotdId");

  useEffect(() => {
    void getMotd();
  }, []);

  const hidden = useMemo(() => {
    return hiddenMotdId === motd?.id;
  }, [hiddenMotdId, motd]);

  const severity = SEVERITIES[motd?.severity || "Low"];

  if (motd && motd?.name && !hidden) {
    return (
      <PanelSection>
        <Focusable
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
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bold" }}>{motd?.name}</span>
            <DialogButton
              style={{
                width: "1em",
                minWidth: "1em",
                height: "1em",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                top: ".75em",
                right: ".75em",
              }}
              onClick={hideMotd}
            >
              <FaTimes
                style={{
                  height: ".75em",
                }}
              />
            </DialogButton>
          </div>
          <span style={{ fontSize: "0.75em", whiteSpace: "pre-line" }}>{motd?.description}</span>
        </Focusable>
      </PanelSection>
    );
  }
  return null;
}
