"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { useLocation } from "@/lib/location-context";
import { MapPin } from "lucide-react";

export default function StatesView() {
  const { isHindi } = useSite();
  const { location } = useLocation();
  const router = useRouter();
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location) router.replace(`/state/${location.stateSlug}/city/${location.citySlug}`);
  }, [location, router]);

  if (location) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{isHindi ? "राज्य" : "States"}</span>
      </div>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <MapPin size={26} className="text-brand" /> {isHindi ? "राज्य चुनें" : "Browse by State"}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {states.map((s) => (
          <Link key={s.id} href={`/state/${s.slug}`}
            className="block px-4 py-3 rounded-xl border bg-white text-sm font-medium text-gray-700 hover:bg-brand-tint hover:text-brand hover:border-brand transition">
            {isHindi ? (s.nameHindi || s.name) : s.name}
          </Link>
        ))}
      </div>

      {states.length === 0 && <p className="text-center text-gray-500 py-12">{isHindi ? "कोई राज्य उपलब्ध नहीं" : "No states available"}</p>}
    </div>
  );
}
