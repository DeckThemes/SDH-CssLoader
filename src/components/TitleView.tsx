import { DialogButton, Navigation, staticClasses, Focusable } from "decky-frontend-lib";
import { BsGearFill } from "react-icons/bs";
import { FaInfo, FaStore } from "react-icons/fa";

export function TitleView({ onDocsClick }: { onDocsClick?: () => {} }) {
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
        paddingTop: "3px",
        paddingRight: "0px",
        paddingLeft: "0px",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className={staticClasses.Title}
    >
      <div style={{ marginRight: "auto", flex: 0.9 }}>CUSTOM TITLE</div>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onStoreClick}
      >
        <FaStore style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onSettingsClick}
      >
        <BsGearFill style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onDocsClick}
      >
        <FaInfo style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
    </Focusable>
  );
}
