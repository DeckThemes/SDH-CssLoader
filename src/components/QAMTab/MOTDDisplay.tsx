import { DialogButton, Focusable, PanelSection } from "decky-frontend-lib";
import { useEffect, useState, useMemo } from "react";
import { Motd } from "../../apiTypes/Motd";
import { genericGET } from "../../api";
import { FaTimes } from "react-icons/fa";
import { useCssLoaderState } from "../../state";
import { getHiddenMotd, setHiddenMotd } from "../../backend/pythonMethods/pluginSettingsMethods";

export function MOTDDisplay() {
  const [motd, setMotd] = useState<Motd | undefined>();
  const { hiddenMotd, setGlobalState } = useCssLoaderState();
  useEffect(() => {
    async function getMotd() {
      const res = await genericGET("/motd", false);
      setMotd(res);
    }
    getMotd();
  }, []);
  async function dismiss() {
    if (motd) {
      await setHiddenMotd(motd.id);
      const res = await getHiddenMotd();
      if (res.success) {
        setGlobalState("hiddenMotd", res.result);
      }
    }
  }

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

  const hidden = useMemo(() => {
    return hiddenMotd === motd?.id;
  }, [hiddenMotd, motd]);

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
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bold" }}>{motd?.name}</span>
            <DialogButton
              style={{
                width: "20px",
                minWidth: "20px",
                height: "20px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={dismiss}
            >
              <FaTimes />
            </DialogButton>
          </div>
          <span style={{ fontSize: "0.75em", whiteSpace: "pre-line" }}>{motd?.description}</span>
        </Focusable>
      </PanelSection>
    );
  }
  return null;
}
