import { DialogButton, Router, staticClasses, Focusable } from "decky-frontend-lib";
import { BsGearFill } from "react-icons/bs";
import { FaStore } from "react-icons/fa";

export function TitleView() {
  //   const onSettingsClick = () => {
  //     Router.CloseSideMenus();
  //     Router.Navigate("/decky/settings");
  //   };

  const onStoreClick = () => {
    Router.CloseSideMenus();
    Router.Navigate("/cssloader/theme-manager");
  };

  return (
    <Focusable
      style={{ display: "flex", paddingTop: "3px", paddingRight: "16px" }}
      className={staticClasses.Title}
    >
      <div style={{ marginRight: "auto", flex: 0.9 }}>CSS Loader</div>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onStoreClick}
      >
        <FaStore style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
      {/* <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={onSettingsClick}
      >
        <BsGearFill style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton> */}
    </Focusable>
  );
}
