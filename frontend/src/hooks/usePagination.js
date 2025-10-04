import { useCallback, useState, useMemo } from "react";

export default function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage); // trenutna strana
  const [lastPage, setLastPage] = useState(1); // ukupno strana

  const reset = useCallback(() => setPage(initialPage), [initialPage]); // vrati na pocetak
  const setFromMeta = useCallback((meta) => { 
    const lp = Number(meta?.last_page ?? 1);
    setLastPage(lp > 0 ? lp : 1);
  }, []); // postavljamo lastPage iz meta podataka

  const hasMore = useMemo(() => page < lastPage, [page, lastPage]); // da li imamo jos stranica

  return { page, setPage, lastPage, setLastPage, setFromMeta, reset, hasMore };
}
