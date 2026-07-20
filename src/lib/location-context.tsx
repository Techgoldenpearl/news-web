"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { publicApi } from "./api";

interface SelectedLocation {
  stateSlug: string;
  stateName: string;
  stateNameHindi?: string;
  citySlug: string;
  cityName: string;
  cityNameHindi?: string;
}

interface LocationContextType {
  location: SelectedLocation | null;
  setLocation: (loc: SelectedLocation) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  setLocation: () => {},
  clearLocation: () => {},
});

const STORAGE_KEY = "selectedLocation";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<SelectedLocation | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLocationState(JSON.parse(saved));
        return;
      } catch {}
    }

    const applyLocationResponse = (data: any) => {
      if (!data?.state || !data?.city) return false;
      setLocation({
        stateSlug: data.state.slug,
        stateName: data.state.name,
        stateNameHindi: data.state.nameHindi,
        citySlug: data.city.slug,
        cityName: data.city.name,
        cityNameHindi: data.city.nameHindi,
      });
      return true;
    };

    // Silent, best-effort pre-fill only — never navigates the visitor anywhere.
    // Prefer the browser's own Geolocation API (works correctly on localhost,
    // more accurate) and fall back to IP-based detection if permission is
    // denied, unavailable, or times out.
    const fallbackToIpDetect = () => {
      publicApi.detectLocation().then((r) => applyLocationResponse(r.data)).catch(() => {});
    };

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          publicApi.nearestLocation(pos.coords.latitude, pos.coords.longitude)
            .then((r) => { if (!applyLocationResponse(r.data)) fallbackToIpDetect(); })
            .catch(fallbackToIpDetect);
        },
        () => fallbackToIpDetect(),
        { timeout: 8000, maximumAge: 600000 }
      );
    } else {
      fallbackToIpDetect();
    }
  }, []);

  const setLocation = (loc: SelectedLocation) => {
    setLocationState(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  };

  const clearLocation = () => {
    setLocationState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
