export function generateParamStr(origSearchOpts: any, filterPrepend: string = "") {
  // This can be done with 'new URLSearchParams(obj)' but I want more control
  const searchOpts = Object.assign({}, origSearchOpts);
  if (filterPrepend) {
    searchOpts.filters = filterPrepend + searchOpts.filters;
  }
  let paramString = "?";
  Object.keys(searchOpts).forEach((key, i) => {
    // @ts-ignore  typescript doesn't know how object.keys works 🙄
    if (searchOpts[key]) {
      // @ts-ignore
      paramString += `${i !== 0 ? "&" : ""}${key}=${searchOpts[key]}`;
    }
  });
  return paramString;
}
