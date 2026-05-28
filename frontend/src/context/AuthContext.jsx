// src/context/AuthContext.jsx — Global auth state with JWT + localStorage
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check loading

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('gemledger_token');
    const storedUser = localStorage.getItem('gemledger_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('gemledger_token');
        localStorage.removeItem('gemledger_user');
      }
    }
    setLoading(false);
  }, []);

  // Login — stores token and user in state + localStorage
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;

    localStorage.setItem('gemledger_token', newToken);
    localStorage.setItem('gemledger_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  // Logout — clears all auth state
  const logout = useCallback(() => {
    localStorage.removeItem('gemledger_token');
    localStorage.removeItem('gemledger_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
