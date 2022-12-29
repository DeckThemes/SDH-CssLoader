import { DialogButton } from "decky-frontend-lib";
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { ThemeQueryRequest, ThemeQueryResponse } from "../apiTypes";
import { generateParamStr } from "../logic";
import * as python from "../python";
import { useCssLoaderState } from "../state";

export function LoadMoreButton({
  fetchPath = "/themes",
  origSearchOpts,
  setThemeArr,
  themeArr,
  paramStrFilterPrepend = "",
}: {
  fetchPath: string;
  origSearchOpts: ThemeQueryRequest;
  setThemeArr: any;
  themeArr: ThemeQueryResponse;
  paramStrFilterPrepend: string;
}) {
  const { apiUrl } = useCssLoaderState();
  const [loadMoreCurPage, setLoadMorePage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  function loadMore() {
    setLoading(true);
    // This just changes "All" to "", as that is what the backend looks for
    let searchOptClone = { ...origSearchOpts };
    searchOptClone.page = loadMoreCurPage + 1;
    const searchOpts = generateParamStr(
      searchOptClone.filters !== "All" ? searchOptClone : { ...searchOptClone, filters: "" },
      paramStrFilterPrepend
    );
    python.genericGET(`${apiUrl}${fetchPath}${searchOpts}`).then((data) => {
      if (data) {
        setThemeArr({ total: themeArr.total, items: [...themeArr.items, ...data.items] });
        setLoadMorePage((curPage) => curPage + 1);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoadMorePage(1);
  }, [origSearchOpts]);
  return (
    <>
      {themeArr.items.length < themeArr.total ? (
        <>
          <DialogButton onClick={loadMore} disabled={loading}>
            Load More
          </DialogButton>
        </>
      ) : null}
    </>
  );
}
