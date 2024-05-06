import { ImSpinner5 } from "react-icons/im";

export function Loading() {
  return (
    <div
      style={{
        display: "flex",
        gap: "1em",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>
        {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            .spinny {
              animation: spin 1s linear infinite;
            }
          `}
      </style>
      <ImSpinner5 className="spinny" size={48} />
      <span style={{ fontWeight: "bold", fontSize: "2.5em" }}>Loading</span>
    </div>
  );
}
