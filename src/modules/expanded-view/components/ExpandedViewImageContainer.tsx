import { Focusable, ScrollPanelGroup } from "@decky/ui";
import { useExpandedViewAction, useExpandedViewValue } from "../context";

export function ExpandedViewImageContainer() {
  const data = useExpandedViewValue("data");
  const {
    imageCarouselEntryWidth,
    imageCarouselEntryHeight,
    selectedImageHeight,
    selectedImageWidth,
  } = useExpandedViewValue("imageAreaStyleKeys");
  const focusedImageId = useExpandedViewValue("focusedImageId");

  const setFocusedImage = useExpandedViewAction("setFocusedImage");

  return (
    <Focusable className="cl_expandedview_imageareacontainer">
      {/* Image Carousel Container */}
      {data.images.length > 1 && (
        <ScrollPanelGroup
          // @ts-ignore
          focusable={false}
          className="cl_expandedview_imagecarouselcontainer"
        >
          {data.images.map((image) => (
            <Focusable
              onFocus={() => {
                setFocusedImage(image.id);
              }}
              className="cl_expandedview_imagecarouselentry"
              focusWithinClassName="gpfocuswithin"
              onActivate={() => {}}
            >
              <img
                width={imageCarouselEntryWidth}
                height={imageCarouselEntryHeight}
                style={{ objectFit: "contain" }}
                src={`https://api.deckthemes.com/blobs/${image.id}`}
              />
            </Focusable>
          ))}
        </ScrollPanelGroup>
      )}

      {/* Selected Image Display */}
      <Focusable
        className="cl_expandedview_selectedimage"
        focusWithinClassName="gpfocuswithin"
        onActivate={() => {}}
      >
        <img
          width={selectedImageWidth}
          height={selectedImageHeight}
          style={{ objectFit: "contain" }}
          src={
            data.images.length > 0
              ? `https://api.deckthemes.com/blobs/${focusedImageId}`
              : `https://share.deckthemes.com/cssplaceholder.png`
          }
        />
        {data.images.length > 1 && (
          <div className="cl_expandedview_imagenumbercontainer">
            <span className="font-bold">
              {data.images.findIndex((blob) => blob.id === focusedImageId) + 1}/{data.images.length}
            </span>
          </div>
        )}
      </Focusable>
    </Focusable>
  );
}
