import { useEffect, useMemo, useState } from "react";
import { HolidaysRS } from "../api/publicHolidays";

export default function usePublicHolidays(year) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Kada se promeni godina, ucitavamo praznike
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const key = `holidays-RS-${year}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          // ako postoji kes u localStorage, koristimo ga odmah
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
        // Ako nema keša, pozovi API
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


  // Mapiraj praznike po datumu radi bržeg pristupa
  const map = useMemo(() => {
    const m = new Map();
    for (const h of holidays) m.set(h.date, h);
    return m;
  }, [holidays]);


  // Vrati objekat praznika za dati datum
  function getHoliday(dateStr /* "YYYY-MM-DD" */) {
    return map.get(dateStr) || null;
  }
  // Vrati true ako je prosledjeni datum praznik
  function isHoliday(dateStr) {
    return !!getHoliday(dateStr);
  }

  // Vraca podatke i pomocne funkcije za rad sa praznicima
  return { holidays, loading, error, isHoliday, getHoliday };
}
