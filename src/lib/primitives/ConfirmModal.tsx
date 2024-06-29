import { ConfirmModal as CM } from "@decky/ui";
import { StyleProvider } from "../components";

export function ConfirmModal({
  closeModal,
  children,
  onConfirm,
  title,
  confirmText,
  cancelText,
}: {
  closeModal?: () => void;
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}) {
  return (
    <CM
      strTitle={title}
      strOKButtonText={confirmText}
      strCancelButtonText={cancelText}
      onOK={onConfirm}
      onCancel={closeModal}
      onEscKeypress={closeModal}
    >
      <StyleProvider>{children}</StyleProvider>
    </CM>
  );
}
