import { useCSSLoaderStateValue } from "@/backend";
import { FaEyeSlash } from "react-icons/fa";

export function QamHiddenThemesDisplay() {
  const unpinnedThemes = useCSSLoaderStateValue("unpinnedThemes");

  if (unpinnedThemes.length === 0) {
    return null;
  }

  return (
    <div className="cl-qam-hidden-themes-display">
      <FaEyeSlash />
      <span>
        {unpinnedThemes.length} theme{unpinnedThemes.length > 1 ? "s are" : "is"} hidden.
      </span>
    </div>
  );
}
