import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import logo from "./assets/Aurora.png";

export default function App() {
  return (
    <>
      <nav className="topbar">
        <Link to="/" className="brand">
          <img src={logo} alt="Logo" className="brand-logo"/>
        </Link>
        <div className="spacer" />
        <Link to="/login" className="navlink">Login</Link>
        <Link to="/register" className="navlink">Register</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<div className="page">404</div>} />
      </Routes>
    </>
  );
}
