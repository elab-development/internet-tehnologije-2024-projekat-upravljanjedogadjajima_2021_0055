import { useEffect, useState } from "react";
import { getEventById } from "../api/endpoints";

const toDate = s => {
  if (!s) return null;
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d) ? null : d;
};

export default function EventDetails({ eventId }) {
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!eventId){ setEv(null); return; }
    let alive = true;
    setLoading(true); setErr(null);
    getEventById(eventId)
      .then(res => { if (alive) setEv(res?.data || null); })
      .catch(()  => { if (alive) setErr("Ne mogu da učitam detalje."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId]);

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

      <h3 className="details-heading">Starts at:</h3>
      <div className="pill">{day}<br/>{time}</div>

      <h3 className="details-heading">Category:</h3>
      <div className="pill">{ev.category?.name ?? "—"}</div>

      <h3 className="details-heading">Created by:</h3>
      <div className="pill">{ev.user?.name ?? "—"}</div>

      <h3 className="details-heading">Description:</h3>
      <div className="desc-box">{ev.description || "—"}</div>
    </div>
  );
}
