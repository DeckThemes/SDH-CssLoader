import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
  ToggleField,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaShip } from "react-icons/fa";
import { GoGear } from "react-icons/go"
import * as python from "./python";
import { Theme } from "./theme"
var reload = function(){};

import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }
var firstTime : boolean = true;
var themeList_backup : Theme[] = []

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  // const [result, setResult] = useState<number | undefined>();

  python.setServer(serverAPI);
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
    <PanelSection title="Panel Section">
      {
        elements
      }
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Example Plugin</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
