import { Focusable, PanelSectionRow } from "decky-frontend-lib";
import { ThemeError } from "../ThemeTypes";

export function ThemeErrorCard({ errorData }: { errorData: ThemeError }) {
  return (
    <div
      style={{
        width: "100%",
        margin: 0,
        padding: 0,
        height: "3em",
      }}
    >
      <div
        style={{
          backgroundColor: "#f002",
          display: "flex",
          flexDirection: "column",
          padding: "0.5em",
        }}
      >
        <span>
          <b>{errorData[0]}</b>
        </span>
        <span>{errorData[1]}</span>
      </div>
    </div>
  );
}
