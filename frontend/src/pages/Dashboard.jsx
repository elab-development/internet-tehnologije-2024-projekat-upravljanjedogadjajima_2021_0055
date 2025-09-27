import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import AppButton from "../components/AppButton";
import { getUsers, createUser, updateUser, deleteUser } from "../api/endpoints";
import EventsPanel from "../components/EventsPanel";
import EventDetails from "../components/EventDetails";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  // lista clanova i selekcija
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState(null);

  // ucitavanje liste
  useEffect(() => {
    (async () => {
      const { data } = await getUsers();
      setMembers(data);
      if (!selectedId && data?.length) setSelectedId(data[0].id);
    })();
  }, []); // prvi render

  const selectedMember = useMemo(
    () => members.find(m => m.id === selectedId) || null,
    [members, selectedId]
  );

  // CREATE
  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      const { data } = await createUser(payload);
      setOpenCreate(false);
      // osveži listu
      const res = await getUsers();
      setMembers(res.data);
      setSelectedId(data?.id ?? res.data.at(-1)?.id);
    } catch (e) {
      alert(e?.response?.data?.message || "Neuspelo kreiranje.");
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT
  const handleEdit = async (payload) => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await updateUser(selectedId, payload);
      setOpenEdit(false);
      const res = await getUsers();
      setMembers(res.data);
    } catch (e) {
      alert(e?.response?.data?.message || "Neuspela izmena.");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await deleteUser(selectedId);
      setOpenDelete(false);
      const res = await getUsers();
      setMembers(res.data);
      setSelectedId(res.data[0]?.id ?? null);
    } catch (e) {
      alert(e?.response?.data?.message || "Neuspešno brisanje.");
    } finally {
      setSubmitting(false);
    }
  };

 const handleSelectMember = (val) => {
  const id = Number(val?.id ?? val);
  setSelectedId(Number.isFinite(id) ? id : null);
  setSelectedEventId(null); // reset desnog panela
}; 

  return (
    <div className="app-shell">
      <Sidebar
        selectedId={selectedId}
        onSelect={handleSelectMember}
        onAddUser={() => isAdmin && setOpenCreate(true)}   
        onEditUser={() => isAdmin && setOpenEdit(true)}    
        onDeleteUser={() => isAdmin && setOpenDelete(true)}  
        onLogout={logout}
      />

      <main className="main-col">
        <h1>Dobrodošao, {user?.name || user?.email} 👋</h1>
        
        <EventsPanel
          selectedUserId={selectedId}
          currentEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

      </main>

      <aside className="right-col">
        <EventDetails eventId={selectedEventId} />
      </aside>

      {/* CREATE */}
      <Modal open={openCreate} onClose={() => !submitting && setOpenCreate(false)} title="Novi korisnik">
        <UserForm mode="create" onSubmit={handleCreate} submitting={submitting}/>
      </Modal>

      {/* EDIT */}
      <Modal open={openEdit} onClose={() => !submitting && setOpenEdit(false)} title={`Izmena: ${selectedMember?.name || ""}`}>
        <UserForm mode="edit" initial={selectedMember || {}} onSubmit={handleEdit} submitting={submitting}/>
        <div className="modal-footer">
          <AppButton variant="primary" onClick={() => setOpenDelete(true)} disabled={!selectedId}>
            Obriši korisnika
          </AppButton>
        </div>
      </Modal>

      {/* DELETE confirm */}
      <Modal open={openDelete} onClose={() => !submitting && setOpenDelete(false)} title="Potvrda brisanja">
        <p>Da li sigurno želiš da obrišeš korisnika <b>{selectedMember?.name}</b>?</p>
        <div className="modal-footer">
          <AppButton onClick={() => setOpenDelete(false)}>Odustani</AppButton>
          <AppButton onClick={handleDelete} disabled={submitting}>Obriši</AppButton>
        </div>
      </Modal>
    </div>
  );
}