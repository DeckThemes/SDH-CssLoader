import { DialogButton, Focusable } from "decky-frontend-lib";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

export function PageSelector({
  total,
  perPage,
  currentPage,
  onChoose,
}: {
  total: number;
  perPage: number;
  currentPage: number;
  onChoose: (page: number) => void;
}) {
  const totalPages = Math.trunc(total / perPage) + (total % perPage === 0 ? 0 : 1);
  return (
    <>
      <style>
        {/* I know the god forsaken amount of !important's here, but it's necessary if I dont want to apply the style individually to each element. */}
        {`
                .PageSelectorRoot {
                    margin-top: 4px;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 1em !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                .PageSelectorButton {
                    width: 0.5em !important;
                    min-width: 0.5em !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                .PageSelectorButtonContent {
                    overflow: visible !important;
                }
            `}
      </style>
      <Focusable className="PageSelectorRoot">
        {total > perPage ? (
          <>
            <DialogButton
              style={{ display: currentPage !== 1 ? "flex !important" : "none !important" }}
              className="PageSelectorButton"
              onClick={() => {
                currentPage !== 1 && onChoose(currentPage - 1);
              }}
            >
              <BsArrowLeft className="PageSelectorButtonContent" />
            </DialogButton>
            {Array(totalPages)
              .fill("")
              .map((_, i) => (
                <DialogButton
                  key={`Page ${i + 1}`}
                  onClick={() => onChoose(i + 1)}
                  className="PageSelectorButton"
                >
                  {i + 1}
                </DialogButton>
              ))}
            <DialogButton
              style={{
                display: currentPage !== totalPages ? "flex !important" : "none !important",
              }}
              className="PageSelectorButton"
              onClick={() => {
                currentPage !== totalPages && onChoose(currentPage + 1);
              }}
            >
              <BsArrowRight className="PageSelectorButtonContent" />
            </DialogButton>
          </>
        ) : null}
      </Focusable>
    </>
  );
}
