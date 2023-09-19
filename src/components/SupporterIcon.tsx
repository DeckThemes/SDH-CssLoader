import { RiMedalFill } from "react-icons/ri";
import { UserInfo } from "../apiTypes/CSSThemeTypes";

export function SupporterIcon({ author }: { author: UserInfo }) {
  const randId = Math.trunc(Math.random() * 69420);
  return (
    <>
      {author?.premiumTier && author?.premiumTier !== "None" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="0" height="0">
            <linearGradient id={`medal-gradient-${randId}`} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop
                stopColor={
                  author?.premiumTier == "Tier3"
                    ? "#de2cf7"
                    : author?.premiumTier == "Tier2"
                    ? "#FCC200"
                    : "#B4B4B4"
                }
                offset="0%"
              />
              <stop
                stopColor={
                  author?.premiumTier == "Tier3"
                    ? "rgb(26,159,255)"
                    : author?.premiumTier == "Tier2"
                    ? "#FCC200"
                    : "#B4B4B4"
                }
                offset="100%"
              />
            </linearGradient>
          </svg>
          <RiMedalFill
            id="supporter-tt"
            style={{
              height: "24px",
              width: "24px",
              fill: `url(#medal-gradient-${randId})`,
            }}
          />
          <span>{`Tier ${author?.premiumTier?.slice(-1)} Patreon Supporter`}</span>
        </div>
      )}
    </>
  );
}
