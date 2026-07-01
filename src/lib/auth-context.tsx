"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { authApi } from "./api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  subscription?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setUser(res.data.user);
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
