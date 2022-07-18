import {
  ButtonItem,
  PanelSectionRow,
  Focusable,
  DialogButton,
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaShip } from "react-icons/fa";

import * as python from "../python";

// TODO
export const ThemeBrowserPage: VFC = () => {
  const [themeArr, setThemeArr] = useState([]);

  function reloadThemes() {
    python.resolve(python.reloadThemeDbData(), () => {
      python.resolve(python.getThemeDbData(), setThemeArr);
    });
  }

  function getThemes() {
    python.resolve(python.getThemeDbData(), setThemeArr);
  }

  useEffect(() => {
    getThemes();
  }, []);

  return (
    <>
      <PanelSectionRow>
        <ButtonItem
          layout='below'
          onClick={() => {
            reloadThemes();
          }}>
          Reload Themes
        </ButtonItem>
      </PanelSectionRow>
      <Focusable style={{ display: "flex", flexWrap: "wrap" }}>
        {themeArr.map((e, i) => {
          return (
            <div
              style={{
                backgroundImage: 'url("' + e.preview_image + '")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "260px",
                margin: "10px",
                borderRadius: "5px",
              }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "RGBA(0,0,0,0.8)",
                  width: "100%",
                  height: "100%",
                  borderRadius: "5px",
                }}>
                <span
                  style={{
                    marginTop: "5px",
                    fontSize: "1.5em",
                    fontWeight: "bold",
                  }}>
                  {e.name}
                </span>
                <div
                  style={{
                    width: "240px",
                    backgroundImage: 'url("' + e.preview_image + '")',
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}></div>
                <div
                  style={{
                    width: "240px",
                    textAlign: "center",
                    display: "flex",
                  }}>
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: "1em",
                      textShadow: "rgb(48, 48, 48) 0px 0 10px",
                    }}>
                    {e.author}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "1em",
                      textShadow: "rgb(48, 48, 48) 0px 0 10px",
                    }}>
                    {e.version}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    width: "240px",
                    marginBottom: "10px",
                  }}>
                  <div>
                    <DialogButton>
                      <span>Install</span>
                    </DialogButton>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Focusable>
    </>
  );
};
