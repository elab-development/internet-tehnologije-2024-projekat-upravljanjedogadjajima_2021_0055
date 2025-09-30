import { useEffect, useMemo, useState } from "react";
import { HolidaysRS } from "../api/publicHolidays";

export default function usePublicHolidays(year) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const key = `holidays-RS-${year}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (alive) setHolidays(parsed);
          setLoading(false);
          // paralelno refresh-ujemo
          HolidaysRS(year).then(data => {
            localStorage.setItem(key, JSON.stringify(data));
            if (alive) setHolidays(data);
          }).catch(()=>{});
          return;
        }
        const data = await HolidaysRS(year);
        localStorage.setItem(key, JSON.stringify(data));
        if (alive) setHolidays(data);
      } catch (e) {
        if (alive) setError("Ne mogu da učitam praznike.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [year]);

  const map = useMemo(() => {
    const m = new Map();
    for (const h of holidays) m.set(h.date, h);
    return m;
  }, [holidays]);

  function getHoliday(dateStr /* "YYYY-MM-DD" */) {
    return map.get(dateStr) || null;
  }
  function isHoliday(dateStr) {
    return !!getHoliday(dateStr);
  }

  return { holidays, loading, error, isHoliday, getHoliday };
}
