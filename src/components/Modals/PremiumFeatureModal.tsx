import { Focusable, ModalRoot } from "decky-frontend-lib";

export function PremiumFeatureModal({ closeModal, blurb }: { closeModal?: any; blurb: string }) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <Focusable style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "2em", fontWeight: "bold" }}>Premium Feature</span>
        <p>{blurb}</p>
        <span>
          To support DeckThemes and unlock premium features, visit https://patreon.com/deckthemes
        </span>
      </Focusable>
    </ModalRoot>
  );
}
