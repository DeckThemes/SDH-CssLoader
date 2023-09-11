import { SidebarNavigation } from "decky-frontend-lib";
import { BsFolderFill } from "react-icons/bs";
import { RiPaintFill, RiSettings2Fill } from "react-icons/ri";
import { ThemeSettings } from "./ThemeSettings";
import { PresetSettings } from "./PresetSettings";
import { PluginSettings } from "./PluginSettings";
import { Credits } from "./Credits";
import { AiFillGithub, AiFillHeart } from "react-icons/ai";
import { DonatePage } from "./DonatePage";

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
          .CSSLoader_FullTheme_ToggleContainer {
            flex-grow: 1;
            position: relative;
          }
          /* The actual element of the ToggleContainer with the BG */
          .CSSLoader_FullTheme_ToggleContainer > div {
            background: #23262e;
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
            height: 1.25em !important;
          }
          /* Since we manually force the height of the container, we have to adjust the text and ToggleSwitch */
          .CSSLoader_FullTheme_ToggleContainer > div > div > div {
            transform: translate(0, -1px);
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
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>
      <SidebarNavigation
        pages={[
          { title: "Themes", icon: <RiPaintFill />, content: <ThemeSettings /> },
          { title: "Profiles", icon: <BsFolderFill />, content: <PresetSettings /> },
          { title: "Settings", icon: <RiSettings2Fill />, content: <PluginSettings /> },
          { title: "Donate", icon: <AiFillHeart />, content: <DonatePage /> },
          { title: "Credits", icon: <AiFillGithub />, content: <Credits /> },
        ]}
      ></SidebarNavigation>
    </>
  );
}
