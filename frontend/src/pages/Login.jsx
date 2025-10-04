import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/Card";
import TextField from "../components/TextField";
import AppButton from "../components/AppButton";
import Notice from "../components/Notice";
import logo from "../assets/Aurora.png";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, loginGuest } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGuest = () => {
    loginGuest();
    nav("/dashboard");
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!emailRe.test(form.email)) e.email = "Unesite ispravan email.";
    if (form.password.length < 6) e.password = "Lozinka mora imati najmanje 6 karaktera.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      nav("/dashboard");
    } catch (err) {
      const res = err?.response;
      if (res?.status === 422 && res.data?.errors) {
        // Laravel validation
        const e = {};
        Object.entries(res.data.errors).forEach(([k, arr]) => (e[k] = arr?.[0]));
        setErrors(e);
        setMsg(res.data.message || "Proverite unete podatke.");
      } else if (res?.status === 401) {
        setMsg(res.data?.message || "Pogrešan email ili lozinka.");
      } else {
        setMsg("Prijava nije uspela. Pokušajte ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-grid login-grid">
      <Card 
        header={<img src={logo} alt="Logo" className="card-logo" />}
        title="Login"
      >
        {msg && <Notice kind="danger">{msg}</Notice>}
        <form onSubmit={onSubmit}>
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
            label="Lozinka"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="row-between">
            <label className="chk">
              <input type="checkbox" name="remember" checked={form.remember} onChange={onChange}/>
              <span>Zapamti me</span>
            </label>
            <Link className="link" to="/register">Registruj se</Link>
          </div>
          <AppButton type="submit" disabled={loading}>
            {loading ? "Ulogujem..." : "Uloguj me"}
          </AppButton>
          <button type="button" className="guest-btn" onClick={handleGuest} disabled={loading}>
            Pristupi kao gost
          </button>
        </form>
      </Card>
    </div>
  );
}