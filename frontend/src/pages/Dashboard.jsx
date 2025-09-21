import { useAuth } from "../auth/AuthContext";
import AppButton from "../components/AppButton";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="page">
      <h1>Dobrodošao, {user?.name || user?.email} 👋</h1>
      <p>Ovde ide dashboard.</p>
      <AppButton onClick={logout}>Odjava</AppButton>
    </div>
  );
}