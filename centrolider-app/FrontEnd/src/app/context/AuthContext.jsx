import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cl_token");
    if (token) {
      api
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem("cl_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const onLogout = () => setUser(null);
    window.addEventListener("cl:logout", onLogout);
    return () => window.removeEventListener("cl:logout", onLogout);
  }, []);

  const login = async (username, password) => {
    const { token, user } = await api.login({ username, password });
    localStorage.setItem("cl_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("cl_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
