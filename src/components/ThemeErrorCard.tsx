import { Focusable, PanelSectionRow } from "decky-frontend-lib";
import { ThemeError } from "../ThemeTypes";

export function ThemeErrorCard({ errorData }: { errorData: ThemeError }) {
  return (
    <PanelSectionRow>
      <Focusable
        onClick={() => {}}
        style={{
          width: "100%",
          margin: 0,
          height: "3em",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-1em",
            width: "calc(100% + 2em)",
            top: "0",
            padding: "0.5em 1em",
            backgroundColor: "#f002",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>
            <b>{errorData[0]}</b>
          </span>
          <span>{errorData[1]}</span>
        </div>
      </Focusable>
    </PanelSectionRow>
  );
}
