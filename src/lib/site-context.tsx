"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface Site {
  id: number;
  name: string;
  slug: string;
  language: string;
  region?: string;
  tagline?: string;
  primaryColor?: string;
  logoUrl?: string;
}

interface SiteContextType {
  site: Site | null;
  sites: Site[];
  switchSite: (siteId: number) => void;
  isHindi: boolean;
  loading: boolean;
}

const SiteContext = createContext<SiteContextType>({
  site: null,
  sites: [],
  switchSite: () => {},
  isHindi: false,
  loading: true,
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sites").then((r) => {
      const allSites = r.data;
      setSites(allSites);

      const savedId = localStorage.getItem("siteId");
      const initial = savedId
        ? allSites.find((s: Site) => s.id === parseInt(savedId)) || allSites[0]
        : allSites[0];

      if (initial) {
        setSite(initial);
        api.defaults.headers.common["X-Site-ID"] = String(initial.id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const switchSite = (siteId: number) => {
    const found = sites.find((s) => s.id === siteId);
    if (found) {
      setSite(found);
      localStorage.setItem("siteId", String(siteId));
      api.defaults.headers.common["X-Site-ID"] = String(siteId);
      window.location.reload();
    }
  };

  return (
    <SiteContext.Provider value={{ site, sites, switchSite, isHindi: site?.language === "hi", loading }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
