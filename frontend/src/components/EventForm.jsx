import { useEffect, useState } from "react";
import TextField from "./TextField";
import AppButton from "./AppButton";
import { getCategories } from "../api/endpoints";

export default function EventForm({ mode = "create", initial = {}, onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");      // yyyy-mm-dd
  const [time, setTime] = useState("");      // hh:mm
  const [description, setDescription] = useState("");

  // kategorije
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catErr, setCatErr] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  const [errors, setErrors] = useState({});

  // ucitavanje kategorija
  useEffect(() => {
    (async () => {
      setCatLoading(true);
      try {
        const res = await getCategories();
        const raw = res?.data;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.categories)
              ? raw.categories
              : [];
        setCategories(arr);
      } catch (e) {
        console.error("getCategories failed:", e);
        setCatErr("Ne mogu da učitam kategorije.");
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  // drugacije ako je edit
  useEffect(() => {
    if (mode !== "edit") return;

    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");

    // "YYYY-MM-DD HH:mm:ss" -> date + time
    if (initial?.starts_at) {
      const s = String(initial.starts_at).replace(" ", "T");
      const d = new Date(s);
      if (!isNaN(d)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
        setTime(`${hh}:${mi}`);
      }
    }

    // postavi kategoriju iz initial-a 
    if (initial?.category_id) setCategoryId(String(initial.category_id));
  }, [mode, initial]);

  // ako nema kategorije iz initial-a, postavi prvu iz liste
  useEffect(() => {
    if (categoryId) return;                      
    if (categories.length) setCategoryId(String(categories[0].id));
  }, [categories, categoryId]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Unesi naziv.";
    if (!date) errs.date = "Izaberi datum.";
    if (!time) errs.time = "Izaberi vreme.";
    if (!categoryId) errs.category = "Izaberi kategoriju.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Laravel format "YYYY-MM-DD HH:mm:ss"
    const starts_at = `${date} ${time}:00`;

    onSubmit?.({
      name,
      starts_at,
      description: description || null,
      category_id: Number(categoryId),
    });
  };

  const submitLabel = submitting
    ? (mode === "edit" ? "Čuvam…" : "Dodajem…")
    : (mode === "edit" ? "Sačuvaj izmene" : "Dodaj događaj");

  return (
    <form onSubmit={submit}>

      <TextField
        label="Naziv"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        error={errors.name}
      />

      <div className="field">
        <label className="field-label">Kategorija</label>
        <select
          className={`field-input select${errors.category ? " has-error" : ""}`}
          value={categoryId}
          onChange={(e)=>setCategoryId(e.target.value)}
          disabled={catLoading || !!catErr || categories.length === 0}
        >
          {catLoading && <option value="">Učitavanje…</option>}
          {!catLoading && catErr && <option value="">{catErr}</option>}
          {!catLoading && !catErr && categories.length === 0 && (
            <option value="">Nema kategorija</option>
          )}
          {!catLoading && !catErr && categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
        {errors.category && <div className="field-error">{errors.category}</div>}
      </div>

      <div className="field">
        <label className="field-label">Datum</label>
        <input
          className={`field-input${errors.date ? " has-error" : ""}`}
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">Vreme</label>
        <input
          className={`field-input${errors.time ? " has-error" : ""}`}
          type="time"
          value={time}
          onChange={(e)=>setTime(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">Opis (opciono)</label>
        <textarea
          className="field-input"
          rows={3}
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />
      </div>

      <AppButton type="submit" disabled={submitting || !categories.length}>
        {submitLabel}
      </AppButton>
    </form>
  );
}
