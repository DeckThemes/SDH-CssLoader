export function ExpandedViewStyles({
  gapBetweenCarouselAndImage,
  imageAreaPadding,
  imageAreaWidth,
  selectedImageHeight,
  selectedImageWidth,
  imageCarouselEntryHeight,
  imageCarouselEntryWidth,
}: {
  gapBetweenCarouselAndImage: number;
  imageAreaPadding: number;
  imageAreaWidth: number;
  selectedImageHeight: number;
  selectedImageWidth: number;
  imageCarouselEntryHeight: number;
  imageCarouselEntryWidth: number;
}) {
  return (
    <style>
      {`
    .flex {
      display: flex;
    }
    .flex-col {
      display: flex;
      flex-direction: column;
    }
    .justify-center {
      justify-content: center;
    }
    .items-center {
      align-items: center;
    }
    .justify-between {
      justify-content: space-between;
    }
    .bold {
      font-weight: bold;
    }
    .text-sm {
      font-size: 0.75em;
    }
    .text-xl {
      font-size: 1.5em;
    }
    .text-lg {
      font-size: 1.25em;
    }
    .top-offset {
      margin-top: 40px;
      height: calc(100% - 40px);
    }
    .padding-1 {
      padding: 1em;
    }
    .w-screen {
      width: 100vw;
    }
    .h-screen {
      height: 100vh;
    }
    .w-full {
      width: 100%;
    }
    .h-full {
      height: 100%;
    }
    .bg-storeBg {
      background: rgb(27, 40, 56);;
    }
    .gap-1 {
      gap: 1em;
    }
    .gap-1\\/4 {
      gap: 0.25em;
    }
    .gap-1\\/2 {
      gap: 0.5em;
    }
    .pb-1 {
      padding-bottom: 1em;
    }
    .flex-1 {
      flex: 1;
    }
    .image-area-container {
      gap: ${gapBetweenCarouselAndImage}px;
      padding: ${imageAreaPadding}px;
    }
    .title-container {
      padding: 1em;
      padding-top: 0;
    }
    .justify-end {
      justify-content: flex-end;
    }
    .overflow-y-auto {
      overflow-y: auto;
    }
    .buttons-container {
      position: sticky;
      padding-top: 1em;
      flex: 1;
    }
    .theme-data-container {
      height: max-content;
      min-height: 100%;
      background: rgba(14, 20, 27, 0.8);
      width: ${imageAreaWidth}px;
    }
    .button-bg {
      background: #2a4153;
      padding: 1em;
    }
    .blue-button {
      background: #1a9fff !important;
    }
    .blue-button.gpfocuswithin {
      background: white !important;
    }
    .blue-text {
      color: rgb(26, 159, 255);
    }
    .gray-text {
      color: rgb(124, 142, 163);
    }
    .back-button {
      min-width: 25% !important;
      width: 25% !important;
      align-self: flex-end;
      padding: 10px 0 !important;
    }
    .star-button {
      min-width: 30% !important;
      padding: 8px 12px !important;
      width: fit-content !important;
    }
    .padding-horiz-1 {
      padding-left: 1em;
      padding-right: 1em;
    }
    .selected-image {
      width: ${selectedImageWidth}px;
      height: ${selectedImageHeight}px;
      position: relative;
    }
    .image-carousel-entry {
      width: ${imageCarouselEntryWidth}px;
      height: ${imageCarouselEntryHeight}px;
      position: relative;
    }
    .image-carousel-container {
      width: ${imageCarouselEntryWidth}px;
      height: ${selectedImageHeight}px;
      display: flex;
      justify-content: space-around;
      flex-direction: column;
    }
    .image-number-container {
      width: 3em;
      height: 2em;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000a;
      position: absolute;
      bottom: 1em;
      right: 1em;
    }
    .install-text {
      width: 200px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .name-text {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 1.5em;
      font-weight: bold;
    }
    .target-text {
      background: rgba(59, 90, 114, 0.5) !important;
      color: rgb(26, 159, 255) !important;
      padding: 8px 12px !important;
      width: fit-content !important;
    }
    .target-text.gpfocuswithin {
      background: white !important;
      color: black !important;
    }
    .install-button-container {
      display: flex;
      gap: 0.25em;
    }
    .configure-button {
      width: 1em !important;
      min-width: 1em !important;
      position: relative;
    }
    .absolute-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    `}
    </style>
  );
}
