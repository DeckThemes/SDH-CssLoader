import { useEffect, useRef, useState } from "react";
import * as python from "../../python";
import { CssLoaderContextProvider, useCssLoaderState } from "../../state";
import { Focusable, ModalRoot } from "decky-frontend-lib";
import { genericGET } from "../../api";
import { PartialCSSThemeInfo, ThemeQueryResponse, UserInfo } from "../../apiTypes";
import { ImSpinner5 } from "react-icons/im";
import { VariableSizeCard } from "../ThemeManager";
import { ThemeBrowserCardStyles } from "../Styles";
import { SupporterIcon } from "../SupporterIcon";

export function AuthorViewModalRoot({
  closeModal,
  authorData,
}: {
  closeModal?: any;
  authorData: UserInfo;
}) {
  return (
    <>
      <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
        {/* @ts-ignore */}
        <CssLoaderContextProvider cssLoaderStateClass={python!.globalState}>
          <AuthorViewModal closeModal={closeModal} authorData={authorData} />
        </CssLoaderContextProvider>
      </ModalRoot>
    </>
  );
}

function AuthorViewModal({
  authorData,
  closeModal,
}: {
  authorData: UserInfo;
  closeModal: () => {};
}) {
  const { setGlobalState } = useCssLoaderState();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [themes, setThemes] = useState<PartialCSSThemeInfo[]>([]);

  const firstThemeRef = useRef<HTMLDivElement>();

  async function fetchThemeData() {
    const data: ThemeQueryResponse = await genericGET(
      `/users/${authorData.id}/themes?page=1&perPage=50&filters=CSS&order=Most Downloaded`
    );
    if (data?.total && data.total > 0) {
      setThemes(data.items);
      setLoaded(true);
    }
  }
  useEffect(() => {
    fetchThemeData();
  }, []);

  useEffect(() => {
    if (firstThemeRef?.current) {
      setTimeout(() => {
        firstThemeRef?.current?.focus();
      }, 10);
    }
  }, [loaded]);

  return (
    <Focusable>
      {loaded ? (
        <>
          <style>
            {`
            .CSSLoader_AuthorView_Avatar {
              margin-right: 0.25em;
            }
            .CSSLoader_AuthorView_Username {
              font-size: 2em;
              font-weight: bold;
            }
            .CSSLoader_AuthorView_AuthorContainer {
              display: flex;
              margin-bottom: 1em;
              align-items: center;
            }
            .CSSLoader_AuthorView_SupporterIconContainer {
              margin-left: auto;
              transform: translateY(2px);
            }
            `}
          </style>
          <ThemeBrowserCardStyles customCardSize={4} />
          <div className="CSSLoader_AuthorView_AuthorContainer">
            <img
              className="CSSLoader_AuthorView_Avatar"
              src={authorData.avatar}
              height={50}
              width={50}
            />
            <span className="CSSLoader_AuthorView_Username">{authorData.username}</span>
            <div className="CSSLoader_AuthorView_SupporterIconContainer">
              <SupporterIcon author={authorData} />
            </div>
          </div>
          <Focusable
            style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center" }}
          >
            {themes.map((e, i) => {
              return (
                <VariableSizeCard
                  onClick={() => {
                    setGlobalState("currentExpandedTheme", e);
                    closeModal();
                  }}
                  refPassthrough={i === 0 ? firstThemeRef : null}
                  cols={4}
                  data={e}
                />
              );
            })}
          </Focusable>
        </>
      ) : (
        <>
          <style>
            {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            .spinny {
              animation: spin 1s linear infinite;
            }
          `}
          </style>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              gap: "1em",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImSpinner5 className="spinny" size={48} />
            <span style={{ fontWeight: "bold", fontSize: "2.5em" }}>Loading</span>
          </div>
        </>
      )}
    </Focusable>
  );
}
