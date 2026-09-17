"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { reporterAuthApi } from "./reporter-api";
import type { Reporter } from "@/types";

interface ReporterAuthContextType {
  reporter: Reporter | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ReporterAuthContext = createContext<ReporterAuthContextType>({
  reporter: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function ReporterAuthProvider({ children }: { children: ReactNode }) {
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await reporterAuthApi.me();
      setReporter(res.data);
    } catch {
      setReporter(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await reporterAuthApi.login(email, password);
    setReporter(res.data.reporter);
  };

  const logout = async () => {
    await reporterAuthApi.logout().catch(() => {});
    setReporter(null);
  };

  return (
    <ReporterAuthContext.Provider value={{ reporter, loading, login, logout, refresh }}>
      {children}
    </ReporterAuthContext.Provider>
  );
}

export const useReporterAuth = () => useContext(ReporterAuthContext);
