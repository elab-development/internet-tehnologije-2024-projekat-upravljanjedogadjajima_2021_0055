// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { tokenStorage } from "../api/tokenStorage";
import { postLogin, getMe, postLogout } from "../api/endpoints";

const AuthCtx = createContext(null);
const USER_KEY = "user"; // cuvamo korisnika u localStorage 

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const token = tokenStorage.read();
      const savedUser = (() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
        catch { return null; }
      })();

      // Ako imamo token → pokušaj da dovuces pravog user-a
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data);
        } catch {
          // token nije validan
          tokenStorage.clear();
          setUser(null);
          localStorage.removeItem(USER_KEY);
        } finally {
          setBooting(false);
        }
        return;
      }

      // Nema tokena, proveravamo da li je sacuvan guest
      if (savedUser?.role === "viewer") {
        setUser(savedUser);
      } else {
        setUser(null);
      }
      setBooting(false);
    })();
  }, []);

  const login = async ({ email, password, remember }) => {
    const { data } = await postLogin({ email, password });
    const token = data.token || data.access_token;
    if (!token) throw new Error("Token not found in response.");

    tokenStorage.set(token, !!remember);

    // realni korisnik sa backenda
    const u = data.user || (await getMe()).data;
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u)); // drzimo user-a i posle refresh-a
  };

  // NOVO: gost (viewer) – bez tokena, samo read-only UI
  const loginGuest = () => {
    const guest = { id: null, name: "Gost", role: "viewer" };
    tokenStorage.clear(); // obavezno: nema Authorization
    setUser(guest);
    localStorage.setItem(USER_KEY, JSON.stringify(guest));
  };

  const logout = async () => {
    const token = tokenStorage.read();
    if (token) {
      try { await postLogout(); } catch (e) { /* ignorisemo 401 */ }
    }
    tokenStorage.clear();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };
  
  const isViewer = user?.role === "viewer";
  const isAdmin  = user?.role === "admin" || user?.role === 1;

  return (
    <AuthCtx.Provider value={{ user, login, loginGuest, logout, booting, isViewer, isAdmin }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
