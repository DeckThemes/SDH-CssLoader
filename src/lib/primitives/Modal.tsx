import { ModalRoot } from "@decky/ui";
import { StyleProvider } from "../components";

export function Modal({
  closeModal,
  children,
  title,
}: {
  closeModal?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <StyleProvider>
        <div>
          <h1>{title}</h1>
          {children}
        </div>
      </StyleProvider>
    </ModalRoot>
  );
}
