import { gamepadDialogClasses } from "@decky/ui";

export const styles = `
.flex {
  display: flex !important;
}

.flex-col {
  flex-direction: column !important;
}

.flex-wrap {
  flex-wrap: wrap !important;
}

.gap-1 {
  gap: 0.25rem !important;
}

.gap-2 {
  gap: 0.5rem !important;
}

.gap-3 {
  gap: 0.75rem !important;
}

.gap-4 {
  gap: 1rem !important;
}

.gap-8 {
  gap: 2rem !important;
}

.items-center {
  align-items: center !important;
}

.items-stretch {
  align-items: stretch !important;
}

.justify-center {
  justify-content: center !important;
}

.justify-around {
  justify-content: space-around !important;
}

.justify-between {
  justify-content: space-between !important;
}

.p-0 {
  padding: 0 !important;
}

.m-0 {
  margin: 0 !important;
}

.mb-0 {
  margin-bottom: 0 !important;
}

.w-full {
  width: 100% !important;
}

.relative {
  position: relative !important;
}

.font-bold {
  font-weight: bold !important;
}

.absolute-center {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* Fullscreen Routes */

.cl_fullscreenroute_container {
  margin-top: 40px !important;
  height: calc(100% - 40px) !important;
  background: #0e141b !important;
}

/* TitleView */

.cl-title-view-button {
  height: 28px !important;
  width: 40px !important;
  min-width: 0 !important;
  padding: 10px 12px !important;
}

.cl-title-view-button-icon {
  margin-top: -4px !important;
  display: block !important;
}

@keyframes onboardingButton {
  0% {
    transform: scale(1) !important;
  }
  50% {
    transform: scale(1.1) !important;
  }
  100% {
    transform: scale(1) !important;
  }
}

.cl-animate-onboarding {
  animation: onboardingButton 1s infinite ease-in-out !important;
}

/* QAM Tab */

.cl-qam-collapse-button-container > div > div > div > div > button {
  height: 10px !important;
}

.cl-qam-themetoggle-notifbubble {
  position: absolute !important;
  top: 0 !important;
  right: -1rem !important;
  background: linear-gradient(45deg, transparent 49%, #fca904 50%) !important;
  /* The focus ring has a z-index of 10000, so this is just to be cheeky */
  z-index: 10001 !important;
  width: 20px !important;
  height: 20px !important;
}

.cl-qam-collapse-button-down-arrow {
  transform: translateY(-13px) !important;
  font-size: 1.5rem !important;
}

.cl-qam-collapse-button-up-arrow {
  transform: translateY(-12px) !important;
  font-size: 1.5rem !important;
}

.cl-qam-component-icon-container {
  margin-left: auto !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.cl-qam-component-color-preview {
  width: 20px !important;
  height: 20px !important;
}

.cl-qam-hidden-themes-display {
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  font-size: 0.75rem !important;
  padding: 8px 0 !important;
}

/* Optional Deps Modal */

.cl-optional-deps-modal-title {
  margin-block-end: 10px !important;
  margin-block-start: 0px !important;
  overflow-x: hidden !important;
  font-size: 1.5rem !important;
  white-space: nowrap !important;
}

/* Theme Store */

.cl-store-filter-field-container {
  display: flex !important;
  flex-direction: column !important;
  min-width: 49% !important;
}


.cl-store-dropdown-hide-spacer > button > div > div {
  width: 100% !important;
  display: flex !important;
  align-items: start !important;
}

.cl-store-dropdown-hide-spacer> button > div > .${gamepadDialogClasses.Spacer} {
  width: 0 !important;
}

.cl-store-searchbar {
  min-width: 55% !important;
}

.cl-store-refresh-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  max-width: 20% !important;
  height: 48% !important;
}

.cl-store-scale-slider {
  min-width: 20% !important;
}

.cl-store-scale-slider > div > div > .${gamepadDialogClasses.FieldChildrenInner} {
  min-width: 100% !important;
}

.cl-store-theme-grid-container {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 5px !important;
}

/* Store Theme Cards */
/* The variables should be injected wherever needed */
/* This module actually is based on font-size, so EM makes sense over REM */

.cl_storeitem_notifbubble {
  position: absolute !important;
  background: linear-gradient(135deg, #fca904 50%, transparent 51%) !important;
  z-index: 10001 !important;
  left: 0 !important;
  top: 0 !important;
  color: black;
  font-size: var(--cl-storeitem-fontsize) !important;
  width: var(--cl-storeitem-bubblesize) !important;
  height: var(--cl-storeitem-bubblesize) !important;
}
.cl_storeitem_bubbleicon {
  padding: 0.25em !important;
}
.cl_storeitem_container {
  display: flex !important;
  flex-direction: column !important;
  background-color: #ACB2C924 !important;
  overflow: hidden !important;
  width: var(--cl-storeitem-width) !important;
}
.gpfocuswithin.cl_storeitem_container {
  background-color: #ACB2C947 !important;
}
.cl_storeitem_imagecontainer {
  overflow: hidden !important;
  position: relative !important;
  width: var(--cl-storeitem-width) !important;
  height: var(--cl-storeitem-imgheight) !important;
}
.cl_storeitem_supinfocontainer {
  display: flex !important;
  gap: 0.5em !important;
  width: 100% !important;
  align-items: center !important;
  justify-content: center !important;
  position: absolute !important;
  bottom: 0 !important;
  transform: translateY(100%) !important;
  opacity: 0 !important;
  transition-property: transform,opacity !important;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83) !important;
  transition-duration: 0.15s !important;
  font-size: var(--cl-storeitem-fontsize) !important;
}
.gpfocuswithin > div > .cl_storeitem_supinfocontainer {
  transform: translateY(0) !important;
  opacity: 1 !important;
  transition-delay: 0.1s !important;
}
.cl_storeitem_maininfocontainer {
  display: flex !important;
  flex-direction: column !important;
  padding: 0.5em !important;
  font-size: var(--cl-storeitem-fontsize) !important;
}
.cl_storeitem_image {
  object-fit: cover !important;
  transition-property: filter,transform !important;
  transition-duration: 0.32s !important;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83) !important;
}
.cl_storeitem_imagedarkener {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  opacity: 0 !important;
  transition-property: opacity !important;
  transition-duration: 0.65s !important;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83) !important;
  background: linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 30%) !important;
  mix-blend-mode: multiply !important;
  width: var(--cl-storeitem-width) !important;
  height: var(--cl-storeitem-imgheight) !important;
}
.gpfocuswithin > div > .cl_storeitem_imagedarkener {
  opacity: 1 !important;
}
.cl_storeitem_title {
  font-weight: bold !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}
.cl_storeitem_iconinfoitem {
  display: flex !important;
  gap: 0.25em !important;
  align-items: center !important;
}
.cl_storeitem_subtitle {
  font-size: 0.75em !important;
}

/* Expanded View */

@keyframes cl_spin {
  to {
    transform: rotate(360deg);
  }
}
.cl_spinny {
  animation: cl_spin 1s linear infinite !important;
}

.cl_expandedview_loadingtext {
  font-size: 2.5rem !important;
  font-weight: bold !important;
}

.cl_expandedview_container {
  background: rgb(27, 40, 56) !important;
  padding: 0 1rem !important;
  gap: 1rem !important;
  display: flex !important;
  justify-content: space-between !important;
}

.cl_expandedview_scrollpanel {
  display: flex !important;
  margin-bottom: 40px !important;
  height: calc(100vh - 80px) !important
}

.cl_expandedview_themedatacontainer {
  display: flex !important;
  flex-direction: column !important;
  height: max-content !important;
  min-height: 100% !important;
  background: rgba(14, 20, 27, 0.8) !important;
  width: var(--cl-ev-image-area-width) !important;
}

.cl_expandedview_imageareacontainer {
  display: flex !important;
  gap: var(--cl-ev-gap-between-carousel-and-image) !important;
  padding: var(--cl-ev-image-area-padding) !important;
}

.cl_expandedview_imagecarouselcontainer {
  display: flex !important;
  justify-content: space-around !important;
  flex-direction: column !important;
  width: var(--cl-ev-image-carousel-entry-width) !important;
  height: var(--cl-ev-selected-image-height) !important;
}

.cl_expandedview_imagecarouselentry {
  width: var(--cl-ev-image-carousel-entry-width) !important;
  height: var(--cl-ev-image-carousel-entry-height) !important;
  position: relative !important;
}

.cl_expandedview_selectedimage {
  position: relative !important; 
  width: var(--cl-ev-selected-image-width) !important;
  height: var(--cl-ev-selected-image-height) !important;
}

.cl_expandedview_imagenumbercontainer {
  width: 3em !important;
  height: 2em !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #000a !important;
  position: absolute !important;
  bottom: 1em !important;
  right: 1em !important;
}

.cl_expandedview_infocontainer {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  padding-bottom: 1rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0.25rem !important;
}

.cl_expandedview_title {
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  font-size: 1.5rem !important;
  font-weight: bold !important;
}

.cl_expandedview_version {
  font-size: 1.25rem !important;
  font-weight: bold !important;
}

.cl_expandedview_graytext {
  color: rgb(124, 142, 163) !important;
}

.cl_expandedview_bluetext {
  color: rgb(26, 159, 255) !important;
}

.cl_expandedview_targetbuttonscontainer {
  display: flex !important;
  gap: 0.25rem !important;
}

.cl_expandedview_targetbutton {
  background: rgba(59, 90, 114, 0.5) !important;
  color: rgb(26, 159, 255) !important;
  padding: 8px 12px !important;
  width: fit-content !important;
}

.cl_expandedview_targetbutton.gpfocuswithin {
  background: white !important;
  color: black !important;
}

.cl_expandedview_buttonscontainer {
  position: sticky !important;
  padding-top: 1rem !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0.25em !important;
}

.cl_expandedview_singlebuttoncontainer {
  background: #2a4153 !important;
  padding: 1rem !important;
}

.cl_expandedview_starbutton {
  min-width: 30% !important;
  padding: 8px 12px !important;
  width: fit-content !important;
}

.cl_expandedview_installtext {
  width: 200px !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
}

.cl_expandedview_bluebutton {
  background: #1a9fff !important;
}
.cl_expandedview_bluebutton.gpfocuswithin {
  background: white !important;
}

.cl_expandedview_configure_button {
  width: 1rem !important;
  min-width: 1rem !important;
  position: relative;
}
`;
