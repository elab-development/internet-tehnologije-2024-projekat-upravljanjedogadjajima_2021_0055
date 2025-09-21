import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import TextField from "../components/TextField";
import AppButton from "../components/AppButton";
import Notice from "../components/Notice";
import { postRegister } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/Aurora.png";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    remember: true,
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Unesite ime.";
    if (!emailRe.test(form.email)) e.email = "Unesite ispravan email.";
    if (form.password.length < 6) e.password = "Min. 6 karaktera.";
    if (form.password !== form.password_confirmation)
      e.password_confirmation = "Lozinke se ne poklapaju.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await postRegister({
        name: form.name,
        email: form.email,
        phone_number: form.phone_number || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Nakon uspešne registracije – automatski login
      await login({ email: form.email, password: form.password, remember: form.remember });
      nav("/dashboard");
    } catch (err) {
      const res = err?.response;
      if (res?.status === 422 && res.data?.errors) {
        const e = {};
        Object.entries(res.data.errors).forEach(([k, arr]) => (e[k] = arr?.[0]));
        setErrors(e);
        setMsg(res.data.message || "Proverite polja.");
      } else if (res?.status === 409) {
        setMsg(res.data?.message || "Email je već zauzet.");
      } else {
        setMsg("Registracija nije uspela. Pokušajte ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-grid register-grid">
      <Card header={<img src={logo} alt="aurora" className="card-logo" />} title="Registracija">
        {msg && <Notice kind="danger">{msg}</Notice>}

        <form onSubmit={onSubmit}>
          <TextField
            label="Ime"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Vaše ime"
            error={errors.name}
            autoComplete="name"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Unesite email"
            error={errors.email}
            autoComplete="email"
          />
          <TextField
            label="Telefon (opciono)"
            name="phone_number"
            value={form.phone_number}
            onChange={onChange}
            placeholder="+3816..."
            error={errors.phone_number}
            autoComplete="tel"
          />
          <TextField
            label="Lozinka"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="new-password"
          />
          <TextField
            label="Potvrdi lozinku"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={onChange}
            placeholder="••••••••"
            error={errors.password_confirmation}
            autoComplete="new-password"
          />

          <div className="row-between">
            <label className="chk">
              <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} />
              <span>Zapamti me</span>
            </label>
            <Link className="link" to="/login">Već imaš nalog? Uloguj se.</Link>
          </div>

          <AppButton type="submit" disabled={loading}>
            {loading ? "Kreiram nalog..." : "Registruj me"}
          </AppButton>
        </form>
      </Card>
    </div>
  );
}