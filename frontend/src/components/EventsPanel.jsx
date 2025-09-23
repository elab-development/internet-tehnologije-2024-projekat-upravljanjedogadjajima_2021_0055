import { useEffect, useMemo, useState } from "react";
import { getEventsByUser, createEvent } from "../api/endpoints";
import EventCard from "./EventCard";
import Modal from "./Modal";
import EventForm from "./EventForm";
import { useAuth } from "../auth/AuthContext";
import addEventIcon from "../assets/add-event.png";

export default function EventsPanel({ selectedUserId, onSelectEvent, currentEventId }) {
  const { user } = useAuth();
  const authUserId = user?.id;

  // normalizacija id-a (broj ili objekat sa .id)
  const normId = (v) => Number(v?.id ?? v);

  // „+” samo kada korisnik gleda sopstveni profil
  const viewingOwn = useMemo(() => {
    const sel = normId(selectedUserId);
    const me  = normId(authUserId);
    return Number.isFinite(sel) && Number.isFinite(me) && String(sel) === String(me);
  }, [selectedUserId, authUserId]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // helper: učitaj listu ZA DATOG usera (paginacija → res.data.data)
  const reload = async (uid) => {
    setLoading(true); setErr(null);
    try {
      const res = await getEventsByUser(uid);
      const raw = res?.data;
      const arr = Array.isArray(raw?.data) ? raw.data   // paginator
                : Array.isArray(raw)      ? raw
                : Array.isArray(raw?.events) ? raw.events
                : Array.isArray(raw?.data?.data) ? raw.data.data
                : [];
      setEvents(arr);
    } catch {
      setErr("Ne mogu da učitam događaje.");
    } finally {
      setLoading(false);
    }
  };

  // inicijalno/na promenu selekcije
  useEffect(() => {
    // nista nije izabrano → nema liste
    if (!selectedUserId) { setEvents([]); return; }

    // ako je slucajno stigao objekat, uzmi .id
    const uid = normId(selectedUserId);
    if (!Number.isFinite(uid)) { setErr("Nepoznat korisnik."); setEvents([]); return; }

    reload(uid);
  }, [selectedUserId]);

  // Kada kreiramo novi dogadjaj, dodajemo ga na listu i radimo reload
  const handleCreate = async (body) => {
    setSubmitting(true);
    try {
      const me = normId(authUserId);
      body.user_id = me;

      const res = await createEvent(body);
      const created = res?.data;

      setOpenAdd(false);

      // optimistički ubacimo na vrh ako gledaš sopstvenu listu
      if (viewingOwn && created?.id) {
        setEvents(prev => [created, ...prev]);
      }

      // i svakako refresujemo listu kao izvor istine
      const uid = normId(selectedUserId);
      if (Number.isFinite(uid)) {
        await reload(uid);
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Dodavanje nije uspelo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="events-col" style={{ position: "relative" }}>
      <div className="events-scroll">
        {!selectedUserId && <div className="muted">Izaberi člana tima sa leve strane.</div>}
        {selectedUserId && loading && <div className="muted">Učitavanje…</div>}
        {selectedUserId && err && <div className="error">{err}</div>}

        {selectedUserId && !loading && !err && events.length === 0 && (
          <div className="muted">Nema događaja za ovog člana.</div>
        )}

        {selectedUserId && !loading && !err && events.map(ev => (
          <EventCard
            key={ev.id}
            name={ev.name}
            starts_at={ev.starts_at}
            selected={currentEventId === ev.id}
          onClick={() => onSelectEvent?.(ev.id)}
          />
        ))}
      </div>
      

      {/* „+” samo na sopstvenom profilu */}
      {viewingOwn && (
        <button className="event-add" onClick={() => setOpenAdd(true)} title="Novi događaj" type="button">
          <img src={addEventIcon} alt="Dodaj događaj" />
        </button>
      )}

      <Modal open={openAdd} onClose={() => !submitting && setOpenAdd(false)} title="Novi događaj">
        <EventForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>
    </section>
  );
}
