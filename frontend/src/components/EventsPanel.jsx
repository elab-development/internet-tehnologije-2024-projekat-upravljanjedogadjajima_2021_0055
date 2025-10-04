import { useEffect, useMemo, useState } from "react";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../api/endpoints";
import EventCard from "./EventCard";
import Modal from "./Modal";
import EventForm from "./EventForm";
import { useAuth } from "../auth/AuthContext";
import addEventIcon from "../assets/add-event.png";
import editEventIcon from "../assets/edit-event.png";
import deleteEventIcon from "../assets/delete-event.png";
import usePagination from "../hooks/usePagination";

// Dodali smo opcioni tekst pretrage
export default function EventsPanel({ selectedUserId, onSelectEvent, currentEventId, q = "" }) {
  const { user } = useAuth();
  const authUserId = user?.id;
  const isAdmin = user?.role === "admin";
  const isViewer = user?.role === "viewer"; 

  const normId = (v) => Number(v?.id ?? v);
  const uid = normId(selectedUserId);

  // + samo kada gledas sopstveni profil
  const viewingOwn = useMemo(() => {
    const me = normId(authUserId);
    return Number.isFinite(uid) && Number.isFinite(me) && String(uid) === String(me);
  }, [uid, authUserId]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // modali
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // PAGINATION hook
  // Ocekuje se da hook vraca bar: { page, setPage, setFromMeta, reset, hasMore }
  const { page, setPage, setFromMeta, reset, hasMore } = usePagination(1);

  // izabrani event i permisije
  const selectedEvent = useMemo(
    () => events.find(e => e.id === currentEventId) || null,
    [events, currentEventId]
  );
  const canEditDelete = !!selectedEvent && !isViewer && (isAdmin || String(selectedEvent.user_id) === String(authUserId));

  // Refresh prve strane pri manipulaciji sa korisnicima, eventima idt.
  const fetchFirstPage = async () => {
    if (!Number.isFinite(uid)) { setEvents([]); return; }
    setLoading(true); setErr(null);
    try {
      const res = await listEvents({ user_id: uid, page: 1, per_page: 15, q: q || undefined });
      const raw = res?.data || {};
      const arr = Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw) ? raw : [];
      setEvents(arr);
      setFromMeta(raw);                          // postavljamo last_page i sl.
      setPage(Number(raw?.current_page ?? 1));   
    } catch {
      setErr("Ne mogu da učitam događaje.");
    } finally {
      setLoading(false);
    }
  };

  // Kada kliknemo load more ucitavamo sledecu stranu
  const loadMore = async () => {
    if (!Number.isFinite(uid)) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await listEvents({ user_id: uid, page: nextPage, per_page: 15, q: q || undefined });
      const raw = res?.data || {};
      const arr = Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw) ? raw : [];
      setEvents(prev => [...prev, ...arr]);
      setFromMeta(raw);
      setPage(Number(raw?.current_page ?? nextPage));
    } catch {
      setErr("Ne mogu da učitam događaje.");
    } finally {
      setLoading(false);
    }
  };

  // Inicijalno i na promenu user-a ili query-ja refreshujemo i povlacimo podatke za prvu stranu
  useEffect(() => {
    if (!selectedUserId) { setEvents([]); return; }
    reset();
    fetchFirstPage();

  }, [selectedUserId, q]);

  // Kreiranje, izmena, brisanje dogadjaja i refresh liste
  const handleCreate = async (body) => {
    if (isViewer) { alert("Nije dozvoljeno dodavanje."); return; }
    setSubmitting(true);
    try {
      body.user_id = normId(authUserId);
      const res = await createEvent(body);
      const created = res?.data;
      setOpenAdd(false);

      // optimisticki ubacujemo novi dogadjaj na pocetak liste
      if (viewingOwn && created?.id) {
        setEvents(prev => [created, ...prev]);
      }
      // the moment of truth
      await fetchFirstPage();
    } catch (e) {
      alert(e?.response?.data?.message || "Dodavanje nije uspelo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (payload) => {
    if (isViewer) { alert("Nije dozvoljena izmena."); return; }
    if (!selectedEvent?.id) return;
    if (!canEditDelete) { alert("Nije dozvoljena izmena."); return; }
    setSubmitting(true);
    try {
      await updateEvent(selectedEvent.id, payload);
      setOpenEdit(false);
      await fetchFirstPage();

      // osvezavamo detalje u desnom panelu
      onSelectEvent?.(null);
      setTimeout(() => onSelectEvent?.(selectedEvent.id), 0);
    } catch (e) {
      alert(e?.response?.data?.message || "Izmena nije uspela.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isViewer) { alert("Nije dozvoljeno brisanje."); return; }
    if (!selectedEvent?.id) return;
    if (!canEditDelete) { alert("Nije dozvoljeno brisanje."); return; }
    setSubmitting(true);
    try {
      await deleteEvent(selectedEvent.id);
      setOpenDelete(false);
      await fetchFirstPage();
      onSelectEvent?.(null); // skini detalje
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

      {/* Load more dugme */}
      {Number.isFinite(uid) && !loading && events.length > 0 && (
        <button
          className="events-loadmore"
          type="button"
          onClick={loadMore}
          disabled={!Number.isFinite(uid) || !events.length || !hasMore}
          title={hasMore ? "Učitaj još" : "Nema više"}
        >
          {hasMore ? "Učitaj još" : "Kraj liste"}
        </button>
      )}

    
      <div className="event-actions">
        {viewingOwn && !isViewer && (
          <button className="event-action-btn" onClick={() => setOpenAdd(true)} title="Novi događaj" type="button">
            <img src={addEventIcon} alt="Dodaj događaj" />
          </button>
        )}
        <button
          className={`event-action-btn ${!canEditDelete ? "disabled" : ""}`}
          title="Edit event"
          type="button"
          disabled={!canEditDelete}
          onClick={() => canEditDelete && setOpenEdit(true)}
        >
          <img src={editEventIcon} alt="Edit" />
        </button>
        <button
          className={`event-action-btn ${!canEditDelete ? "disabled" : ""}`}
          title="Delete event"
          type="button"
          disabled={!canEditDelete}
          onClick={() => canEditDelete && setOpenDelete(true)}
        >
          <img src={deleteEventIcon} alt="Delete" />
        </button>
      </div>

      {/* Modali */}
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
