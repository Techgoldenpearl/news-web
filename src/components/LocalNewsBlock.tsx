"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { useLocation } from "@/lib/location-context";
import { CompactNewsCard } from "./CompactNewsCard";
import { NewsCard } from "./NewsCard";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

export function LocalNewsBlock() {
  const { isHindi } = useSite();
  const { location } = useLocation();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!location) { setArticles([]); return; }
    publicApi.cityArticles(location.stateSlug, location.citySlug)
      .then((r) => setArticles(r.data?.articles || []))
      .catch(() => setArticles([]));
  }, [location?.stateSlug, location?.citySlug]);

  if (!location || articles.length === 0) return null;

  const cityDisplayName = isHindi ? (location.cityNameHindi || location.cityName) : location.cityName;

  return (
    <section className="bg-white rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-(--line)">
        <div className="flex items-center gap-2.5">
          <MapPin size={18} className="text-brand" />
          <h2 className="text-lg font-black text-gray-900">
            {isHindi ? `${cityDisplayName} की खबरें` : `News from ${cityDisplayName}`}
          </h2>
        </div>
        <Link href={`/state/${location.stateSlug}/city/${location.citySlug}`} className="flex items-center gap-0.5 text-xs font-bold text-brand hover:opacity-80 transition uppercase tracking-wide">
          {isHindi ? "और देखें" : "View More"} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {articles[0] && (
          <div className="lg:col-span-1">
            <NewsCard {...articles[0]} size="md" />
          </div>
        )}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {articles.slice(1, 7).map((a) => <CompactNewsCard key={a.id} {...a} />)}
        </div>
      </div>
    </section>
  );
}
