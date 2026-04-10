import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch CSRF token on mount, then check auth
    client.get('/auth/csrf/')
      .then(() => client.get('/auth/user/'))
      .then(res => {
        if (res.data.authenticated) setUser(res.data);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await client.post('/auth/login/', { username, password });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await client.post('/auth/logout/');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await client.get('/auth/user/');
    if (res.data.authenticated) setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
