import { useEffect, useMemo, useState } from "react";
import { getEventsByUser, createEvent, updateEvent, deleteEvent } from "../api/endpoints";
import EventCard from "./EventCard";
import Modal from "./Modal";
import EventForm from "./EventForm";
import { useAuth } from "../auth/AuthContext";
import addEventIcon from "../assets/add-event.png";
import editEventIcon from "../assets/edit-event.png";
import deleteEventIcon from "../assets/delete-event.png";

export default function EventsPanel({ selectedUserId, onSelectEvent, currentEventId }) {
  const { user } = useAuth();
  const authUserId = user?.id;
  const isAdmin = user?.role === "admin";

  // normalizacija id-a
  const normId = (v) => Number(v?.id ?? v);

  // + samo kada korisnik gleda sopstveni profil
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
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // helper: ucitaj listu ZA DATOG usera 
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

  const  selectedEvent = useMemo(
    () => events.find(e => e.id === currentEventId) || null,
    [events, currentEventId]
  );
  const canEditDelete = !!selectedEvent && (isAdmin || String(selectedEvent.user_id) === String(authUserId));

  // inicijalno/na promenu selekcije
  useEffect(() => {
    // nista nije izabrano → nema liste
    if (!selectedUserId) { setEvents([]); return; }

    // ako je slucajno stigao objekat, uzmi .id
    const uid = normId(selectedUserId);
    if (!Number.isFinite(uid)) { setErr("Nepoznat korisnik."); setEvents([]); return; }

    reload(uid);
  }, [selectedUserId]);

  // kada kreiramo novi dogadjaj, dodajemo ga na listu i radimo reload
  const handleCreate = async (body) => {
    setSubmitting(true);
    try {
      const me = normId(authUserId);
      body.user_id = me;

      const res = await createEvent(body);
      const created = res?.data;

      setOpenAdd(false);

      // optimisticki ubacimo na vrh 
      if (viewingOwn && created?.id) {
        setEvents(prev => [created, ...prev]);
      }

      // refresh cele liste
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

  const handleEdit = async (payload) => {
    if (!selectedEvent?.id) return;
    if (!canEditDelete) { alert("Nije dozvoljena izmena."); return; }

    setSubmitting(true);
    try {
      await updateEvent(selectedEvent.id, payload);
      setOpenEdit(false);

      // refetch iste liste
      const uid = Number(selectedUserId?.id ?? selectedUserId);
      if (Number.isFinite(uid)) await reload(uid);

      // osvezi detalje
      onSelectEvent?.(null);
      setTimeout(() => onSelectEvent?.(selectedEvent.id), 0);
    } catch (e) {
      alert(e?.response?.data?.message || "Izmena nije uspela.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    if (!canEditDelete) { alert("Nije dozvoljeno brisanje."); return; }

    setSubmitting(true);
    try {
      await deleteEvent(selectedEvent.id);
      setOpenDelete(false);

      // refetch liste
      const uid = Number(selectedUserId?.id ?? selectedUserId);
      if (Number.isFinite(uid)) await reload(uid);

      // obrisi selekciju (desni panel nestaje)
      onSelectEvent?.(null);
    } catch (e) {
      alert(e?.response?.data?.message || "Brisanje nije uspelo.");
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
      
      <div className="event-actions">
        {/* „+” samo na sopstvenom profilu */}
        {viewingOwn && (
          <button className="event-action-btn" onClick={() => setOpenAdd(true)} title="Novi događaj" type="button">
            <img src={addEventIcon} alt="Dodaj događaj" />
          </button>
        )}

        {/* Edit – trazi selektovan event i permisiju */}
        <button
          className={`event-action-btn ${!canEditDelete ? "disabled" : ""}`}
          title="Edit event"
          type="button"
          onClick={() => canEditDelete && setOpenEdit(true)}
        >
          <img src={editEventIcon} alt="Edit" />
        </button>

        {/* Delete – trazi selektovan event i permisiju */}
        <button
          className={`event-action-btn ${!canEditDelete ? "disabled" : ""}`}
          title="Delete event"
          type="button"
          onClick={() => canEditDelete && setOpenDelete(true)}
        >
          <img src={deleteEventIcon} alt="Delete" />
        </button>
      </div>

      <Modal open={openAdd} onClose={() => !submitting && setOpenAdd(false)} title="Novi događaj">
        <EventForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>

      <Modal open={openEdit} onClose={() => !submitting && setOpenEdit(false)} title={`Izmena: ${selectedEvent?.name || ""}`}>
        <EventForm
          mode="edit"
          initial={selectedEvent || {}}
          onSubmit={handleEdit}
          submitting={submitting}
        />
      </Modal>

      <Modal open={openDelete} onClose={() => !submitting && setOpenDelete(false)} title="Potvrda brisanja">
        <p>Da li sigurno želiš da obrišeš događaj <b>{selectedEvent?.name}</b>?</p>
        <div className="modal-footer">
          <button className="btn" onClick={() => setOpenDelete(false)}>Odustani</button>
          <button className="btn primary" onClick={handleDelete} disabled={!canEditDelete || submitting}>Obriši</button>
        </div>
      </Modal>
    </section>
  );
}
