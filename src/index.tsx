import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  SidebarNavigation,
  Router,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import * as python from "./python";
import { Theme } from "./theme";
import { RiPaintFill } from "react-icons/ri";

import { ThemeBrowserPage } from "./theme-manager";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }
var firstTime: boolean = true;
var themeList_backup: Theme[] = [];

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  const [themeList, themeListInternal] = useState<Theme[]>(themeList_backup);

  const setThemeList = (value: any) => {
    let list: Theme[] = [];

    value.forEach((x: any) => {
      let theme = new Theme();
      theme.data = x;
      list.push(theme);
    });
    list.forEach((x) => x.init());

    themeList_backup = list;
    themeListInternal(list);
  };

  const reload = function () {
    python.resolve(python.getThemes(), setThemeList);
  };

  if (firstTime) {
    firstTime = false;
    reload();
  }

  let elements = themeList.map((x) => x.generate());

  return (
    <PanelSection title='Themes'>
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/theme-manager");
          }}>
          Manage Themes
        </ButtonItem>
        <ButtonItem
          layout='below'
          onClick={() => {
            python.resolve(python.reset(), () => reload());
          }}>
          Reload themes
        </ButtonItem>
      </PanelSectionRow>
      {elements}
    </PanelSection>
  );
};

const ThemeManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title='Theme Manager'
      showTitle
      pages={[
        {
          title: "Browse Themes",
          content: <ThemeBrowserPage />,
          route: "/theme-manager/browser",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);

  serverApi.routerHook.addRoute("/theme-manager", () => <ThemeManagerRouter />);

  return {
    title: <div className={staticClasses.Title}>Css Loader</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <RiPaintFill />,
  };
});
