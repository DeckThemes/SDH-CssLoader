import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import * as python from "./python";
import { Theme } from "./theme"
import { RiPaintFill } from "react-icons/ri"
var reload = function(){};

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }
var firstTime : boolean = true;
var themeList_backup : Theme[] = []

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  const [themeList, themeListInternal] = useState<Theme[]>(themeList_backup);

  const setThemeList = (value : any) => {
    let list : Theme[] = []

    value.forEach((x : any) => {
      let theme = new Theme()
      theme.data = x
      list.push(theme)
    })
    list.forEach(x => x.init())

    themeList_backup = list
    themeListInternal(list)
  }

  reload = function() {
    python.resolve(python.getThemes(), setThemeList)
  }

  if (firstTime){
    firstTime = false
    reload()
  }

  let elements = themeList.map((x) => x.generate())

  return (
    <PanelSection title="Themes">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={x => {
          python.resolve(python.reset(), (y : any) => reload())
        }}>Reload themes</ButtonItem>
      </PanelSectionRow>
      {
        elements
      }
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);
  return {
    title: <div className={staticClasses.Title}>Css Loader</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <RiPaintFill />,
  };
});
