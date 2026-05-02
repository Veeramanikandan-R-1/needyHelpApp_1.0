import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken, setOnUnauthorized, API_BASE } from '../api/client';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try { await api.get('/v1/user/logout'); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  // Hydrate full profile from /me. Server sets req.user from JWT.
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/v1/user/me');
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // On mount, try to silently refresh (uses httpOnly cookie if present)
  useEffect(() => {
    setOnUnauthorized(() => {
      // Only show toast if user was actually logged in (avoids first-load 401)
      setUser((prev) => {
        if (prev) toast.error('Session expired. Please sign in again.');
        return null;
      });
      setAccessToken(null);
    });
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/v1/user/refresh`, {
          withCredentials: true,
        });
        setAccessToken(data.accessToken);
        if (data.user) setUser(data.user);
        else await fetchMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMe]);

  const login = async (emailId, password) => {
    const { data } = await api.post('/v1/user/login', { emailId, password });
    setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    else await fetchMe();
    return data;
  };

  const signup = async (username, emailId, password) => {
    const { data } = await api.post('/v1/user/signup', { username, emailId, password });
    setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    else await fetchMe();
    return data;
  };

  const updateProfile = async (updates) => {
    const { data } = await api.patch('/v1/user/me', updates);
    setUser(data.user);
    return data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.post('/v1/user/change-password', { currentPassword, newPassword });
    // Server invalidates session; clear client state.
    setAccessToken(null);
    setUser(null);
    return data;
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, changePassword, refreshUser: fetchMe, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

