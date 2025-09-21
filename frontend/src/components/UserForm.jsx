import { useState } from "react";
import TextField from "./TextField";
import AppButton from "./AppButton";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserForm({ mode="create", initial={}, onSubmit, submitting }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone_number: initial.phone_number || "",
    password: "",
    password_confirmation: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Unesite ime.";
    if (!emailRe.test(form.email)) e.email = "Neispravan email.";
    if (mode === "create" || form.password) {
      if (form.password.length < 6) e.password = "Min. 6 karaktera.";
      if (form.password !== form.password_confirmation) e.password_confirmation = "Lozinke se ne poklapaju.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      email: form.email,
      phone_number: form.phone_number || null,
      role: form.role,
    };
    if (mode === "create" || form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }
    onSubmit?.(payload);
  };

  return (
    <form onSubmit={submit}>
      <TextField label="Ime" name="name" value={form.name} onChange={onChange} error={errors.name} />
      <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <TextField label="Telefon" name="phone_number" value={form.phone_number} onChange={onChange} />


      {/* Šifra obavezna samo kod kreiranja; kod izmene je opciona */}
      <TextField label="Lozinka" name="password" type="password" value={form.password}
                 onChange={onChange} error={errors.password} />
      <TextField label="Potvrdi lozinku" name="password_confirmation" type="password"
                 value={form.password_confirmation} onChange={onChange} error={errors.password_confirmation} />

      <AppButton type="submit" disabled={submitting}>
        {submitting ? (mode === "create" ? "Kreiram..." : "Čuvam...") : (mode === "create" ? "Kreiraj" : "Sačuvaj")}
      </AppButton>
    </form>
  );
}