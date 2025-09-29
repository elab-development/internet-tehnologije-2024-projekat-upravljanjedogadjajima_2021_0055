import { useCallback, useState, useMemo } from "react";

export default function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(1);

  const reset = useCallback(() => setPage(initialPage), [initialPage]);
  const setFromMeta = useCallback((meta) => {
    const lp = Number(meta?.last_page ?? 1);
    setLastPage(lp > 0 ? lp : 1);
  }, []);

  const hasMore = useMemo(() => page < lastPage, [page, lastPage]);

  return { page, setPage, lastPage, setLastPage, setFromMeta, reset, hasMore };
}
