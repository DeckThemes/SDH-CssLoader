import { shortenNumber, useThemeInstallState } from "@/lib";
import { useExpandedViewAction, useExpandedViewValue } from "../context";
import { FaRegStar, FaStar } from "react-icons/fa";
import { DialogButton } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { ImCog } from "react-icons/im";

export function ExpandedViewButtonsSection() {
  const data = useExpandedViewValue("data");
  const isStarred = useExpandedViewValue("isStarred");
  const toggleStar = useExpandedViewAction("toggleStar");

  const apiFullToken = useCSSLoaderValue("apiFullToken");
  // Because this is an action handled by the expanded view store and not the backend theme store, we can't just use the backend's isWorking
  const [starButtonBlurred, setStarButtonBlurred] = useState<boolean>(false);

  const isWorking = useCSSLoaderValue("isWorking");

  const installTheme = useCSSLoaderAction("installTheme");

  const installStatus = useThemeInstallState(data);

  async function handleStar() {
    setStarButtonBlurred(true);
    await toggleStar();
    setStarButtonBlurred(false);
  }

  const downloadButtonRef = useRef<HTMLElement>(null);
  const [hasBeenFocused, setHasFocused] = useState<boolean>(false);
  useEffect(() => {
    if (downloadButtonRef?.current && !hasBeenFocused) {
      downloadButtonRef.current.focus();
      setHasFocused(true);
    }
  }, [downloadButtonRef, hasBeenFocused]);

  return (
    <div className="cl_expandedview_buttonscontainer">
      {/* Star */}
      <div className="cl_expandedview_singlebuttoncontainer">
        <div className="flex w-full justify-between">
          <div className="flex gap-1 items-center">
            {isStarred ? <FaStar /> : <FaRegStar />}
            {/* Need to make the text size smaller or else it wraps */}
            <span style={{ fontSize: data.starCount >= 100 ? "0.75rem" : "1rem" }}>
              {shortenNumber(data.starCount) ?? data.starCount} Star
              {data.starCount === 1 ? "" : "s"}
            </span>
          </div>
          <DialogButton
            className="cl_expandedview_starbutton"
            onClick={() => void handleStar()}
            disabled={starButtonBlurred || !apiFullToken}
          >
            <div className="flex items-center justify-center gap-1/4">
              <span>
                {!apiFullToken ? "Log In to Star" : isStarred ? "Unstar Theme" : "Star Theme"}
              </span>
            </div>
          </DialogButton>
        </div>
      </div>

      {/* Download / Configure */}
      <div className="cl_expandedview_singlebuttoncontainer">
        <div className="flex flex-col gap-1">
          <span className="cl_expandedview_installtext">Install {data.displayName}</span>
          <span className="font-bold">
            {shortenNumber(data.download.downloadCount) ?? data.download.downloadCount} Download
            {data.download.downloadCount === 1 ? "" : "s"}
          </span>
          <DialogButton
            // @ts-ignore
            ref={downloadButtonRef}
            className="cl_expandedview_bluebutton"
            disabled={isWorking}
            onClick={() => {
              installTheme(data.id);
            }}
          >
            <span className="CssLoader_ThemeBrowser_ExpandedView_InstallText">
              {installStatus === "installed" && "Reinstall"}
              {installStatus === "outdated" && "Update"}
              {installStatus === "notinstalled" && "Install"}
            </span>
          </DialogButton>
          {installStatus === "installed" && (
            <DialogButton
              onClick={() => {
                // TODO: THEME SETTINGS MODAL
                // showModal(
                //   <ThemeSettingsModalRoot
                //     selectedTheme={
                //       installedThemes.find((e) => e.id === fullThemeData.id)?.id ||
                //       // using name here because in submissions id is different
                //       installedThemes.find((e) => e.name === fullThemeData.name)!.id
                //     }
                //   />
                // );
              }}
              className="relative"
            >
              <ImCog className="absolute-center" />
            </DialogButton>
          )}
        </div>
      </div>
    </div>
  );
}
