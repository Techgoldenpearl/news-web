"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, publicApi } from "./api";

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
  subdomain?: string;
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
    Promise.allSettled([publicApi.siteResolve(), api.get("/sites")])
      .then(([resolved, list]) => {
        const allSites = list.status === "fulfilled" ? list.value.data : [];
        setSites(allSites);

        const initial = (resolved.status === "fulfilled" ? resolved.value.data : null) || allSites[0];

        if (initial) {
          setSite(initial);
          api.defaults.headers.common["X-Site-ID"] = String(initial.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const switchSite = (siteId: number) => {
    const found = sites.find((s) => s.id === siteId);
    if (!found) return;

    // In production each site lives on its own domain, so switching should
    // open that domain in a new tab rather than mutating the current one —
    // otherwise the current tab still needs its own X-Site-ID/domain to
    // resolve correctly. In local dev there's only one origin (localhost),
    // so jumping to the live domain would leave the local environment
    // entirely — switch in place instead, same as when no domain is set.
    const isLocalDev = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    const target = !isLocalDev && (found.domain || found.subdomain);
    if (target) {
      const url = /^https?:\/\//.test(target) ? target : `https://${target}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // No domain configured (or running in local dev) — switch in place.
    setSite(found);
    localStorage.setItem("siteId", String(siteId));
    api.defaults.headers.common["X-Site-ID"] = String(siteId);
    window.location.reload();
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
