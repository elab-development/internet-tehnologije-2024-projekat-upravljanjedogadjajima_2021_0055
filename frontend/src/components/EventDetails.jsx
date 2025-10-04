import { useEffect, useState } from "react";
import { getEventById } from "../api/endpoints";
import CategoryManagerModal from "./CategoryManagementModal";
import usePublicHolidays from "../hooks/usePublicHolidays";

const toDate = s => {
  if (!s) return null; 
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d) ? null : d;
};

export default function EventDetails({ eventId }) {
  const [ev, setEv] = useState(null); // detalji o dogadjaju
  const dateOnly = ev?.starts_at ? String(ev.starts_at).slice(0, 10) : null; // "YYYY-MM-DD"
  const year = dateOnly ? Number(dateOnly.slice(0, 4)) : new Date().getFullYear(); // odredjivanje godine
  const [loading, setLoading] = useState(false); // indikator ucitavanja
  const [err, setErr] = useState(null); // greska prilikom ucitavanja
  const [openCats, setOpenCats] = useState(false); // upravljanje kategorijama
  const { isHoliday, getHoliday } = usePublicHolidays(year); // ucitavanje praznika za tu godinu
  const holiday = dateOnly && isHoliday(dateOnly) ? getHoliday(dateOnly) : null; // ako je praznik, dobijamo detalje

  useEffect(() => {
    if (!eventId){ setEv(null); return; }
    let alive = true;
    setLoading(true); setErr(null);
    getEventById(eventId)
      .then(res => { if (alive) setEv(res?.data || null); })
      .catch(()  => { if (alive) setErr("Ne mogu da učitam detalje."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId]); // ucitavanje detalja kada se promeni eventId

  if (!eventId)  return <div className="muted">Klikni događaj da vidiš detalje.</div>;
  if (loading)   return <div className="muted">Učitavanje detalja…</div>;
  if (err)       return <div className="error">{err}</div>;
  if (!ev)       return null;

  const d = toDate(ev.starts_at);
  const day  = d ? d.toLocaleDateString("en-US",{ weekday:"long" }) : "—";
  const time = d
  ? d.toLocaleString("sr-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  : "—";

  return (
    <div className="details-panel">
      <h3 className="details-heading">Event name:</h3>
      <div className="pill">{ev.name}</div>

      <h3 className="details-heading">Starts at:
        {holiday && (
          <span className="holiday-star" title={`Praznik: ${holiday.localName}`}>
            ⭐
          </span>
        )}
      </h3>
      <div className="pill">{day}<br/>{time}</div>

      <div className="details-row">
        <h3 className="details-heading" style={{margin:0}}>Category:</h3>
        <button
          type="button"
          className="inline-btn"
          onClick={() => setOpenCats(true)}
          title="Upravljaj kategorijama"
        >
          +
        </button>
      </div>
      <div className="pill">{ev.category?.name ?? "—"}</div>

      <h3 className="details-heading">Description:</h3>
      <div className="desc-box">{ev.description || "—"}</div>

      <CategoryManagerModal
        open={openCats}
        onClose={() => setOpenCats(false)}
        onChanged={() => {}}
      />
    </div>
  );
}
