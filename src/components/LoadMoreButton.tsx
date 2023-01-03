import { DialogButton } from "decky-frontend-lib";
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { ThemeQueryRequest, ThemeQueryResponse } from "../apiTypes";
import { generateParamStr } from "../logic";
import { genericGET } from "../api";
import { useCssLoaderState } from "../state";

export function LoadMoreButton({
  fetchPath = "/themes",
  origSearchOpts,
  themeArr,
  themeArrVarName,
  paramStrFilterPrepend = "",
  setSnapIndex = undefined,
}: {
  fetchPath: string;
  origSearchOpts: ThemeQueryRequest;
  themeArrVarName: string;
  themeArr: ThemeQueryResponse;
  paramStrFilterPrepend: string;
  setSnapIndex?: Dispatch<SetStateAction<number>>;
}) {
  const { apiUrl, setGlobalState } = useCssLoaderState();
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
    genericGET(`${apiUrl}${fetchPath}${searchOpts}`).then((data) => {
      if (data) {
        setGlobalState(themeArrVarName, {
          total: themeArr.total,
          items: [...themeArr.items, ...data.items],
        });
        if (setSnapIndex) {
          setSnapIndex(origSearchOpts.perPage * loadMoreCurPage - 1);
        }
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
