"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useLocation } from "@/lib/location-context";
import { useSite } from "@/lib/site-context";
import { MapPin, Search, X, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

interface StateItem {
  id: number;
  name: string;
  nameHindi?: string;
  slug: string;
}

interface CityItem {
  id: number;
  name: string;
  nameHindi?: string;
  slug: string;
}

export function CityPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isHindi } = useSite();
  const { setLocation } = useLocation();
  const router = useRouter();
  const [states, setStates] = useState<StateItem[]>([]);
  const [activeState, setActiveState] = useState<StateItem | null>(null);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      publicApi.states().then((r) => setStates(r.data)).catch(() => {});
    } else {
      setActiveState(null);
      setCities([]);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!activeState) return;
    setCitiesLoading(true);
    publicApi
      .cities(activeState.slug)
      .then((r) => setCities(r.data?.cities || []))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [activeState]);

  const filteredStates = useMemo(() => {
    if (!query.trim()) return states;
    const q = query.trim().toLowerCase();
    return states.filter((s) => s.name.toLowerCase().includes(q) || s.nameHindi?.includes(query));
  }, [states, query]);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return cities;
    const q = query.trim().toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q) || c.nameHindi?.includes(query));
  }, [cities, query]);

  if (!open) return null;

  const pickCity = (city: CityItem) => {
    if (!activeState) return;
    setLocation({
      stateSlug: activeState.slug,
      stateName: activeState.name,
      stateNameHindi: activeState.nameHindi,
      citySlug: city.slug,
      cityName: city.name,
      cityNameHindi: city.nameHindi,
    });
    onClose();
    router.push(`/state/${activeState.slug}/city/${city.slug}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          {activeState ? (
            <button onClick={() => setActiveState(null)} className="p-1 text-gray-500 hover:text-brand">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <MapPin size={18} className="text-brand" />
          )}
          <h2 className="font-bold text-sm flex-1">
            {activeState
              ? isHindi ? (activeState.nameHindi || activeState.name) : activeState.name
              : isHindi ? "अपना शहर चुनें" : "Select Your City"}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeState ? (isHindi ? "शहर खोजें..." : "Search city...") : (isHindi ? "राज्य खोजें..." : "Search state...")}
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {!activeState &&
            filteredStates.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveState(s); setQuery(""); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand transition"
              >
                {isHindi ? (s.nameHindi || s.name) : s.name}
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          {!activeState && filteredStates.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{isHindi ? "कोई राज्य नहीं मिला" : "No states found"}</p>
          )}

          {activeState && citiesLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-brand" />
            </div>
          )}
          {activeState && !citiesLoading &&
            filteredCities.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCity(c)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand transition"
              >
                {isHindi ? (c.nameHindi || c.name) : c.name}
              </button>
            ))}
          {activeState && !citiesLoading && filteredCities.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{isHindi ? "कोई शहर नहीं मिला" : "No cities found"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
