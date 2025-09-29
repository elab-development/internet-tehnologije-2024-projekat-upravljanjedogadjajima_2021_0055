import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUsers } from "../api/endpoints"; 
import logo from "../assets/Aurora.png";
import addIcon from "../assets/add-user.png";
import editIcon from "../assets/edit-user.png";
import deleteIcon from "../assets/delete-user.png";
import logoutIcon from "../assets/logout.png";




export default function Sidebar({
  selectedId,
  onSelect,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onLogout,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Ucitavanje korisnika
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getUsers(); // ocekuje [{id, name, email, role, ...}]
        setMembers(data || []);
        if (!selectedId && data?.length) onSelect?.(data[0].id);
      } catch {
        setErr("Ne mogu da učitam tim.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <aside className="sidebar">
      <img src={logo} alt="aurora" className="sidebar-logo" />
      <div className="team-title">Tim</div>

      <div className="user-list">
        {loading && <div className="muted">Učitavanje…</div>}
        {err && <div className="error">{err}</div>}

        {!loading && !err && members.map((m) => (
          <button
            key={m.id}
            className={`user-btn ${selectedId === m.id ? "active" : ""}`}
            onClick={() => onSelect?.(m.id)}
            title={m.email || m.name}
          >
            {m.name}
          </button>
        ))}

        {!loading && !err && members.length === 0 && (
          <div className="muted">Nema članova.</div>
        )}
      </div>

      <div className="sidebar-footer">
        <IconButton
            title={isAdmin ? "Kreiraj korisnika" : "Samo admin"}
            disabled={!isAdmin}
            onClick={isAdmin ? onAddUser : undefined}
        >
            <img src={addIcon} alt="" className="icon-static" />
        </IconButton>

        <IconButton
            title={isAdmin ? "Izmeni korisnika" : "Samo admin"}
            disabled={!isAdmin || !selectedId}
            onClick={isAdmin && selectedId ? onEditUser : undefined}
        >
            <img src={editIcon} alt="" className="icon-static" />
        </IconButton>

        <IconButton
            title={isAdmin ? "Obriši korisnika" : "Samo admin"}
            disabled={!isAdmin || !selectedId}
            onClick={isAdmin && selectedId ? onDeleteUser : undefined}
        >
            <img src={deleteIcon} alt="" className="icon-static" />
        </IconButton>

        <IconButton title="Odjava" onClick={onLogout}>
            <img src={logoutIcon} alt="" className="icon-static" />
        </IconButton>
      </div>
    </aside>
  );
}

function IconButton({ children, title, disabled, danger, onClick }) {
  return (
    <button
  className={`icon-btn sidebar-icon ${disabled ? "disabled" : ""} ${danger ? "danger" : ""}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}