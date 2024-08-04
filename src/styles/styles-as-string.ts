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
  position: absolute;
  background: linear-gradient(135deg, #fca904 50%, transparent 51%);
  z-index: 10001;
  left: 0;
  top: 0;
  color: black;
  font-size: var(--cl-storeitem-fontsize);
  width: var(--cl-storeitem-bubblesize);
  height: var(--cl-storeitem-bubblesize);
}
.cl_storeitem_bubbleicon {
  padding: 0.25em;
}
.cl_storeitem_container {
  display: flex;
  flex-direction: column;
  background-color: #ACB2C924;
  overflow: hidden;
  width: var(--cl-storeitem-width);
}
.gpfocuswithin.cl_storeitem_container {
  background-color: #ACB2C947;
}
.cl_storeitem_imagecontainer {
  overflow: hidden;
  position: relative;
  width: var(--cl-storeitem-width);
  height: var(--cl-storeitem-imgheight);
}
.cl_storeitem_supinfocontainer {
  display: flex;
  gap: 0.5em;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  transform: translateY(100%);
  opacity: 0;
  transition-property: transform,opacity;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
  transition-duration: 0.15s;
  font-size: var(--cl-storeitem-fontsize);
}
.gpfocuswithin > div > .cl_storeitem_supinfocontainer {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.1s;
}
.cl_storeitem_maininfocontainer {
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  font-size: var(--cl-storeitem-fontsize);
}
.cl_storeitem_image {
  object-fit: cover;
  transition-property: filter,transform;
  transition-duration: 0.32s;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
}
.cl_storeitem_imagedarkener {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition-property: opacity;
  transition-duration: 0.65s;
  transition-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
  background: linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 30%);
  mix-blend-mode: multiply;
  width: var(--cl-storeitem-width);
  height: var(--cl-storeitem-imgheight);
}
.gpfocuswithin > div > .cl_storeitem_imagedarkener {
  opacity: 1;
}
.cl_storeitem_title {
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.cl_storeitem_iconinfoitem {
  display: flex;
  gap: 0.25em;
  align-items: center;
}
.cl_storeitem_subtitle {
  font-size: 0.75em;
}

/* Expanded View */

@keyframes cl_spin {
  to {
    transform: rotate(360deg);
  }
}
.cl_spinny {
  animation: cl_spin 1s linear infinite;
}

.cl_fullscreen_loadingtext {
  font-size: 2.5rem;
  font-weight: bold;
}
`;
