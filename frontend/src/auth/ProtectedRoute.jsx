import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { user, booting } = useAuth();
  if (booting) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}