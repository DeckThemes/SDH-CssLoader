// This is fucking awful code, I'm depressed that I even need to write this
// If you figure out a better way to take a string, verify its a color, and convert it to HSL, PLEASE tell me
export const anythingToHSLA = (colorStr: string) => {
  // This uses the built in CSS color validator to check if colorStr is a valid color, if not, it defaults to white
  const cssColorConverter = new Option().style;
  cssColorConverter.color = colorStr;
  const rgbString = cssColorConverter.color || "rgb(255, 255, 255)";

  // This converts the 'rgb(r, g, b)' (or rgba if alpha channel) string value to an array [r, g, b, a]
  // If there is no alpha value, it still outputs an a of 1
  let [r, g, b, a = 1] = rgbString
    .slice(rgbString.indexOf("(") + 1)
    .slice(0, -1)
    .split(",")
    .map((e) => Number(e));

  // This converts the rgb array to an array [h, s, l, a] and returns it
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  const untrimmedArr = [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
  return [...untrimmedArr.map((e) => Math.round(e)), a];
};
