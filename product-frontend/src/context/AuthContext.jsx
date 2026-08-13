import { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../services/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [role, setRole] = useState(() => localStorage.getItem('auth_role'));

  const login = useCallback(async (username, password) => {
    const { data } = await axiosClient.post('/auth/login', { username, password });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_role', data.role);
    setToken(data.token);
    setRole(data.role);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    setToken(null);
    setRole(null);
  }, []);

  const value = {
    token,
    role,
    isAuthenticated: !!token,
    isAdmin: role === 'ADMIN',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
