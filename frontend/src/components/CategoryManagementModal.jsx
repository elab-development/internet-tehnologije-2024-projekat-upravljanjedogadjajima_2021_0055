import { useEffect, useState } from "react";
import Modal from "./Modal";
import AppButton from "./AppButton";
import { useAuth } from "../auth/AuthContext";
import { getCategories, createCategory, deleteCategory } from "../api/endpoints";

export default function CategoryManagerModal({ open, onClose, onChanged }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === 1;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await getCategories(); 
      const raw = res?.data;
      const arr = Array.isArray(raw) ? raw
                : Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw?.categories) ? raw.categories
                : [];
      setList(arr);
    } catch (e) {
      setErr("Ne mogu da učitam kategorije.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) load(); }, [open]);

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    const name = newName.trim();
    if (!name) return;

    setSubmitting(true);
    try {
      await createCategory({ name });
      setNewName("");
      await load();
      onChanged?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Dodavanje nije uspelo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!isAdmin) return; // UI guard

    if ((cat.events_count ?? 0) > 0) {
      alert("Kategorija je povezana sa događajima i ne može se obrisati.");
      return;
    }
    if (!confirm(`Obrisati kategoriju "${cat.name}"?`)) return;

    setSubmitting(true);
    try {
      await deleteCategory(cat.id);
      await load();
      onChanged?.();
    } catch (e) {
      // Ako backend baci gresku
      alert(e?.response?.data?.message || "Brisanje nije uspelo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !submitting && onClose?.()} title="Kategorije">
      {err && <div className="notice danger">{err}</div>}

      <form onSubmit={handleAdd} style={{display:"flex", gap:8, marginBottom:12}}>
        <input
          className="field-input"
          placeholder="Nova kategorija"
          value={newName}
          onChange={(e)=>setNewName(e.target.value)}
        />
        <AppButton type="submit" disabled={submitting || !newName.trim()}>
          Dodaj
        </AppButton>
      </form>

      {loading ? (
        <div className="muted">Učitavanje…</div>
      ) : (
        <ul className="cat-list">
          {list.map(cat => {
            const used = (cat.events_count ?? 0) > 0;
            const canDelete = isAdmin && !used;
            return (
              <li key={cat.id} className="cat-row">
                <div className="cat-name">{cat.name}</div>
                {(typeof cat.events_count === "number") && (
                  <div className="muted" title="Broj događaja">({cat.events_count})</div>
                )}
                <button
                  className="btn"
                  type="button"
                  onClick={() => canDelete && handleDelete(cat)}
                  disabled={!canDelete || submitting}
                  title={!isAdmin ? "Samo admin briše" : used ? "Kategorija se koristi" : "Obriši"}
                >
                  Obriši
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
