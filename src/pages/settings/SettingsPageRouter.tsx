import { SidebarNavigation } from "decky-frontend-lib";
import { BsFolder } from "react-icons/bs";
import { RiPaintFill, RiSettings2Fill } from "react-icons/ri";
import { ThemeSettings } from "./ThemeSettings";
import { PresetSettings } from "./PresetSettings";
import { PluginSettings } from "./PluginSettings";
import { Credits } from "./Credits";
import { AiFillGithub } from "react-icons/ai";

export function SettingsPageRouter() {
  return (
    <>
      <style>
        {`
          /* Remove side padding on the PanelSections */
          .CSSLoader_PanelSection_NoPadding_Parent > .quickaccesscontrols_PanelSection_2C0g0 {
            padding-left: 0;
            padding-right: 0;
          }

          .CSSLoader_FullTheme_ToggleContainer > div {
            background: #23262e;
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
          }
          .CSSLoader_FullTheme_ToggleContainer {
            flex-grow: 1;
            position: relative;
          }
          .CSSLoader_FullTheme_EntryContainer {
            display: flex;
            gap: 0.25em;
            height: auto;
            align-items: center;
            position: relative;
            justify-content: space-between;
          }
          .CSSLoader_FullTheme_DialogButton {
            width: fit-content !important;
            min-width: fit-content !important;
            height: fit-content !important;
            padding: 10px 12px !important;
          }
          .CSSLoader_FullTheme_IconTranslate {
            transform: translate(0px, 2px);
          }
          .CSSLoader_FullTheme_ThemeLabel {
            white-space: nowrap;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>
      <SidebarNavigation
        pages={[
          { title: "Themes", icon: <RiPaintFill />, content: <ThemeSettings /> },
          { title: "Profiles", icon: <BsFolder />, content: <PresetSettings /> },
          { title: "Settings", icon: <RiSettings2Fill />, content: <PluginSettings /> },
          { title: "Credits", icon: <AiFillGithub />, content: <Credits /> },
        ]}
      ></SidebarNavigation>
    </>
  );
}
