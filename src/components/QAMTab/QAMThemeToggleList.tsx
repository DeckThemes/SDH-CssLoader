import { DialogButton, Focusable } from "decky-frontend-lib";
import { useCssLoaderState } from "../../state";
import { ThemeToggle } from "../ThemeToggle";
import { Flags } from "../../ThemeTypes";
import { ThemeErrorCard } from "../ThemeErrorCard";
import { BsArrowDown } from "react-icons/bs";
import { FaEyeSlash } from "react-icons/fa";
import { uploadZipAsBlob } from "../../backend/apiHelpers/profileUploadingHelpers";

export function QAMThemeToggleList() {
  const { localThemeList, unpinnedThemes } = useCssLoaderState();

  if (localThemeList.length === 0) {
    return (
      <>
        <span>You have no themes installed. Get started by selecting the download icon above!</span>
      </>
    );
  }

  return (
    <>
      {/* This styles the collapse buttons, putting it here just means it only needs to be rendered once instead of like 20 times */}
      <style>
        {`
        .CSSLoader_ThemeListContainer {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
        }
        /* PRE Aug 18th Beta */
        .CSSLoader_QAM_CollapseButton_Container > div > div > div > button {
          height: 10px !important;
        }
        /* POST Aug 18th Beta */
        .CSSLoader_QAM_CollapseButton_Container > div > div > div > div > button {
          height: 10px !important;
        }
        `}
      </style>
      <Focusable className="CSSLoader_ThemeListContainer">
        <DialogButton
          onClick={() => {
            uploadZipAsBlob("round.zip");
          }}
        >
          TEST
        </DialogButton>
        <>
          {localThemeList
            .filter((e) => !unpinnedThemes.includes(e.id) && !e.flags.includes(Flags.isPreset))
            .map((x) => (
              <ThemeToggle data={x} collapsible showModalButtonPrompt />
            ))}
        </>
      </Focusable>
      {unpinnedThemes.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5em",
            fontSize: "0.8rem",
            padding: "8px 0",
          }}
        >
          <FaEyeSlash />
          <div>
            {unpinnedThemes.length} theme{unpinnedThemes.length > 1 ? "s are" : "is"} hidden.
          </div>
        </div>
      )}
    </>
  );
}
