"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { advertiserAuthApi } from "./advertiser-api";
import type { Advertiser } from "@/types";

interface AdvertiserAuthContextType {
  advertiser: Advertiser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdvertiserAuthContext = createContext<AdvertiserAuthContextType>({
  advertiser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AdvertiserAuthProvider({ children }: { children: ReactNode }) {
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await advertiserAuthApi.me();
      setAdvertiser(res.data);
    } catch {
      setAdvertiser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await advertiserAuthApi.login(email, password);
    setAdvertiser(res.data.advertiser);
  };

  const logout = async () => {
    await advertiserAuthApi.logout().catch(() => {});
    setAdvertiser(null);
  };

  return (
    <AdvertiserAuthContext.Provider value={{ advertiser, loading, login, logout, refresh }}>
      {children}
    </AdvertiserAuthContext.Provider>
  );
}

export const useAdvertiserAuth = () => useContext(AdvertiserAuthContext);
