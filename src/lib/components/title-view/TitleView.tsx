import { DialogButton, Navigation, Focusable, quickAccessMenuClasses } from "@decky/ui";
import { BsGearFill } from "react-icons/bs";
import { FaDownload } from "react-icons/fa";
import { useCSSLoaderStateValue } from "@/backend";
import { cn } from "../../utils";

export function TitleView() {
  const themes = useCSSLoaderStateValue("themes");

  const onSettingsClick = () => {
    Navigation.CloseSideMenus();
    Navigation.Navigate("/cssloader/settings");
  };

  const onStoreClick = () => {
    Navigation.CloseSideMenus();
    Navigation.Navigate("/cssloader/theme-store");
  };

  return (
    <Focusable
      style={{
        boxShadow: "none",
      }}
      className={`${quickAccessMenuClasses.Title} flex p-0 w-full items-center justify-between`}
    >
      <div style={{ marginRight: "auto" }}>CSS Loader</div>
      <DialogButton
        className={cn("cl-title-view-button", themes.length > 0 && "cl-animate-onboarding")}
        onClick={onStoreClick}
      >
        <FaDownload className="cl-title-view-button-icon" />
      </DialogButton>
      <DialogButton className="cl-title-view-button" onClick={onSettingsClick}>
        <BsGearFill className="cl-title-view-button-icon" />
      </DialogButton>
    </Focusable>
  );
}
