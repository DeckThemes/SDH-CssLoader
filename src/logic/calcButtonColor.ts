export function calcButtonColor(installStatus: string) {
  let filterCSS = "";
  switch (installStatus) {
    case "outdated":
      filterCSS = "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)";
      break;
    default:
      filterCSS = "";
      break;
  }
  return filterCSS;
}
