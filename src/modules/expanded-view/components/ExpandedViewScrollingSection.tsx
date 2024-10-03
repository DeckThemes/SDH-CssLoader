import { DialogButton, Focusable, Navigation, ScrollPanelGroup } from "@decky/ui";
import { useExpandedViewAction, useExpandedViewValue } from "../context";
import { ExpandedViewImageContainer } from "./ExpandedViewImageContainer";
import { useThemeBrowserSharedAction } from "@/modules/theme-store/context";

export function ExpandedViewScrollingSection() {
  const data = useExpandedViewValue("data");
  const close = useExpandedViewAction("close");

  const setTargetOverride = useThemeBrowserSharedAction("setTargetOverride");

  return (
    <ScrollPanelGroup
      // @ts-ignore
      className="cl_expandedview_scrollpanel"
      focusable={false}
      // onCancelButton doesn't work here
      onCancelActionDescription="Back"
      onButtonDown={(evt: any) => {
        if (!evt?.detail?.button) return;
        if (evt.detail.button === 2) {
          close();
        }
      }}
    >
      <Focusable className="cl_expandedview_themedatacontainer">
        <ExpandedViewImageContainer />
        <Focusable className="cl_expandedview_infocontainer">
          {/* Title / Version */}
          <div className="flex gap-2 items-center">
            <span className="cl_expandedview_title">{data.displayName}</span>
            <span className="cl_expandedview_version">{data.version}</span>
          </div>
          {/* Author / Modified Date */}
          <Focusable className="flex gap-1 cl_expandedview_graytext">
            <Focusable
              onOKActionDescription="View Profile"
              focusClassName="gpfocuswithin"
              onActivate={() => {
                // TODO: MODAL
                // showModal(<AuthorViewModalRoot authorData={fullThemeData.author} />);
              }}
            >
              By <span className="cl_expandedview_bluetext">{data.specifiedAuthor}</span>
            </Focusable>
            <span>Last Updated {new Date(data.updated).toLocaleDateString()}</span>
          </Focusable>
          {/* Description */}
          <Focusable
            focusWithinClassName="gpfocuswihtin"
            className="flex flex-col gap-1"
            onActivate={() => {}}
          >
            <span className="font-bold">Description</span>
            <span className={data.description.length > 400 ? "text-sm" : ""}>
              {data.description || (
                <i className="cl_expandedview_graytext">No description provided.</i>
              )}
            </span>
          </Focusable>
          {/* Targets */}
          <Focusable className="flex flex-col gap-1">
            <span className="font-bold">Targets</span>
            <Focusable className="flex gap-1">
              {data.targets.map((target) => (
                <DialogButton
                  onOKActionDescription={`View Other '${target}' Themes`}
                  onClick={() => {
                    setTargetOverride(target);
                    Navigation.NavigateBack();
                  }}
                  className="cl_expandedview_targetbutton"
                >
                  {target}
                </DialogButton>
              ))}
            </Focusable>
          </Focusable>
        </Focusable>
      </Focusable>
    </ScrollPanelGroup>
  );
}
