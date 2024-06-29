import { useDeckyPatchStateAction } from "@/decky-patches";
import { ConfirmModal } from "../../primitives";

export function NavPatchInfoModal({ closeModal }: { closeModal?: () => void }) {
  const setNavPatchState = useDeckyPatchStateAction("setNavPatchState");
  return (
    <ConfirmModal
      title="Enable Nav Patch"
      confirmText="Enable (Recommended)"
      cancelText="Don't Enable"
      closeModal={closeModal}
      onConfirm={() => {
        setNavPatchState(true, true);
        closeModal?.();
      }}
    >
      <p>
        This theme hides elements that can be selected using a controller. For this to work
        correctly, CSS Loader needs to patch controller navigation. Not enabling this feature will
        cause visually hidden elements to be able to be selected using a controller.
      </p>
    </ConfirmModal>
  );
}
