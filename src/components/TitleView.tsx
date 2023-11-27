import { DialogButton, Navigation, staticClasses, Focusable } from "decky-frontend-lib";
import { BsGearFill } from "react-icons/bs";
import { FaDownload } from "react-icons/fa";
import { useCssLoaderState } from "../state";

export function TitleView({ onDocsClick }: { onDocsClick?: () => {} }) {
  const { localThemeList } = useCssLoaderState();

  const onSettingsClick = () => {
    Navigation.CloseSideMenus();
    Navigation.Navigate("/cssloader/settings");
  };

  const onStoreClick = () => {
    Navigation.CloseSideMenus();
    Navigation.Navigate("/cssloader/theme-manager");
  };

  return (
    <Focusable
      style={{
        display: "flex",
        padding: "0",
        width: "100%",
        boxShadow: "none",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className={staticClasses.Title}
    >
      <style>
        {`
        @keyframes onboarding {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        `}
      </style>
      <div style={{ marginRight: "auto" }}>CSS Loader</div>
      <DialogButton
        style={{
          height: "28px",
          width: "40px",
          minWidth: 0,
          padding: "10px 12px",
          animation: localThemeList.length === 0 ? "onboarding 1s infinite ease-in-out" : "",
        }}
        onClick={onStoreClick}
      >
        <FaDownload style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onSettingsClick}
      >
        <BsGearFill style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
    </Focusable>
  );
}
