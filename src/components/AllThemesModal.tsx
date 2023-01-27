import { ButtonItem, DialogButton, Focusable, ModalRoot, showModal } from "decky-frontend-lib";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { CssLoaderContextProvider, CssLoaderState, useCssLoaderState } from "../state";
import { ThemeSettingsModalRoot } from "./ThemeSettingsModal";
import * as python from "../python";

export function AllThemesModalRoot({
  stateClass,
  closeModal,
}: {
  stateClass: CssLoaderState;
  closeModal: any;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <CssLoaderContextProvider cssLoaderStateClass={stateClass}>
        <AllThemesModal stateClass={stateClass} closeModal={closeModal} />
      </CssLoaderContextProvider>
    </ModalRoot>
  );
}

export function AllThemesModal({
  stateClass,
  closeModal,
}: {
  stateClass: CssLoaderState;
  closeModal: any;
}) {
  const { localThemeList, pinnedThemes, setGlobalState } = useCssLoaderState();
  return (
    <>
      <span>Test</span>
      <Focusable style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: "1em" }}>
        {localThemeList.map((e) => {
          const isPinned = !!pinnedThemes.includes(e.id);
          return (
            <>
              <div style={{ display: "flex", gap: "0.25em", height: "fit-content" }}>
                <DialogButton
                  onClick={() => {
                    showModal(
                      // @ts-ignore
                      <ThemeSettingsModalRoot stateClass={stateClass} selectedTheme={e.id} />
                    );
                  }}
                >
                  <span
                    style={{
                      width: "90%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {e.name}
                  </span>
                </DialogButton>
                <DialogButton
                  style={{ width: "fit-content", minWidth: "fit-content", height: "fit-content" }}
                  onClick={() => {
                    let newArr: string[] = [];
                    if (isPinned) {
                      newArr = pinnedThemes.filter((id) => id !== e.id);
                    } else {
                      newArr = [...pinnedThemes, e.id];
                    }
                    python.storeWrite("pinnedThemes", JSON.stringify(newArr));
                    setGlobalState("pinnedThemes", newArr);
                  }}
                >
                  {isPinned ? <BsPinAngleFill color="#FFA500" /> : <BsPinAngle />}
                </DialogButton>
              </div>
            </>
          );
        })}
      </Focusable>
      <ButtonItem
        layout="below"
        onClick={() => {
          closeModal();
        }}
      >
        Close
      </ButtonItem>
    </>
  );
}
