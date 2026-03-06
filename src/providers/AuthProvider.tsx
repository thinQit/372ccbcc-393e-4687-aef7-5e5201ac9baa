'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type AuthUser = { id: string; email: string; full_name?: string | null; role?: string | null };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('bookshop_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: AuthUser }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password });
    window.localStorage.setItem('bookshop_token', data.token);
    setUser(data.user);
  };

  const register = async (full_name: string, email: string, password: string) => {
    const data = await api.post<{ token?: string; user: AuthUser }>('/api/auth/register', {
      full_name,
      email,
      password
    });
    if (data.token) {
      window.localStorage.setItem('bookshop_token', data.token);
    }
    setUser(data.user);
  };

  const logout = () => {
    window.localStorage.removeItem('bookshop_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthProvider;
