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
  domain?: string;
  socialLinks?: { facebook?: string; twitter?: string; instagram?: string; youtube?: string; whatsapp?: string };
  theme?: { primaryColor?: string; secondaryColor?: string; headerBg?: string };
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

  // Normalize primaryColor: may be a top-level field or inside theme object
  const normalizedSite = site
    ? { ...site, primaryColor: site.primaryColor || site.theme?.primaryColor }
    : null;

  // Keep <html lang> in sync with the active site language so Google Translate
  // picks up the correct pageLanguage on init
  useEffect(() => {
    if (normalizedSite?.language) {
      document.documentElement.lang = normalizedSite.language;
    }
  }, [normalizedSite?.language]);

  return (
    <SiteContext.Provider value={{ site: normalizedSite, sites, switchSite, isHindi: normalizedSite?.language === "hi", loading }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
