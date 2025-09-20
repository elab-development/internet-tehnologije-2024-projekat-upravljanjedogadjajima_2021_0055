import { createContext, useContext, useEffect, useState } from "react";
import { tokenStorage } from "../api/tokenStorage";
import { postLogin, getMe, postLogout } from "../api/endpoints";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const token = tokenStorage.read();
      if (!token) { setBooting(false); return; }
      try {
        const { data } = await getMe();
        setUser(data);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async ({ email, password, remember }) => {
    const { data } = await postLogin({ email, password });
    const token = data.token || data.access_token;
    if (!token) throw new Error("Token not found in response.");
    tokenStorage.set(token, !!remember);
    const u = data.user || (await getMe()).data;
    setUser(u);
  };

  const logout = async () => {
    try { await postLogout(); } catch {}
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, booting }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);