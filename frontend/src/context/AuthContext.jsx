// AuthContext.jsx — Authentication state management
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const isDemo = import.meta.env.VITE_DEMO === 'true';

const DEMO_USER = {
  id: 'demo',
  full_name: 'matyoquboff___',
  email: 'matyoquboffrasulbrek@gmail.com',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    isDemo ? DEMO_USER : null
  );
  const [token, setToken] = useState(() =>
    isDemo ? 'demo' : localStorage.getItem('medai_token')
  );
  const [loading, setLoading] = useState(() => !isDemo);

  // On mount: verify stored token (skipped in VITE_DEMO)
  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('medai_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  /**
   * Login: POST /auth/login → { access_token, user }
   */
  const login = async (email, password) => {
    if (isDemo) {
      localStorage.setItem('medai_token', 'demo');
      setToken('demo');
      setUser(DEMO_USER);
      return { access_token: 'demo', user: DEMO_USER };
    }
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('medai_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  /**
   * Register: POST /auth/register
   */
  const register = async (fullName, email, password) => {
    if (isDemo) {
      const u = { ...DEMO_USER, full_name: fullName, email };
      localStorage.setItem('medai_token', 'demo');
      setToken('demo');
      setUser(u);
      return { access_token: 'demo', user: u };
    }
    const { data } = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    localStorage.setItem('medai_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem('medai_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}