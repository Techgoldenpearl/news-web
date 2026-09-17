"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { CityPicker } from "@/components/CityPicker";
import { MapPin, ChevronDown } from "lucide-react";

export default function CityView() {
  const { slug, citySlug } = useParams();
  const { isHindi } = useSite();
  const [data, setData] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  useEffect(() => {
    if (slug && citySlug) publicApi.cityArticles(slug as string, citySlug as string).then((r) => setData(r.data));
  }, [slug, citySlug]);

  useEffect(() => {
    if (slug) publicApi.cities(slug as string).then((r) => setCities(r.data?.cities || [])).catch(() => {});
  }, [slug]);

  if (!data) return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] text-tx-3 pb-3.5">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span className="text-line-2">›</span>
        <Link href={`/state/${slug}`} className="hover:text-brand">{isHindi ? (data.state.nameHindi || data.state.name) : data.state.name}</Link>
        <span className="text-line-2">›</span>
        <span className="text-tx font-medium">{data.city.nameHindi || data.city.name}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-3.5">
        <h1 className="font-serif text-2xl flex items-center gap-2">
          <MapPin size={24} className="text-brand" /> {isHindi ? (data.city.nameHindi || data.city.name) : data.city.name}
        </h1>
        <button
          onClick={() => setCityPickerOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line text-tx-2 hover:text-brand hover:border-brand transition text-sm font-medium"
        >
          {isHindi ? "शहर बदलें" : "Change City"} <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.articles.map((a: any) => <NewsCard key={a.id} {...a} />)}
      </div>
      {data.articles.length === 0 && <p className="text-center text-tx-3 py-12">{isHindi ? "इस शहर के लिए कोई लेख नहीं" : "No articles for this city"}</p>}

      {cities.length > 0 && (
        <div className="bg-panel border border-line rounded-lg p-4 mt-3.5">
          <h3 className="font-semibold text-xs uppercase tracking-wide text-tx-3 mb-3">
            {isHindi ? `${data.state.nameHindi || data.state.name} के अन्य शहर` : `Other cities in ${data.state.name}`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.id} href={`/state/${slug}/city/${c.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${c.slug === citySlug ? "bg-brand-soft text-brand border-brand" : "text-tx-2 border-line hover:border-brand hover:text-tx"}`}>
                {isHindi ? (c.nameHindi || c.name) : c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <CityPicker open={cityPickerOpen} onClose={() => setCityPickerOpen(false)} />
    </div>
  );
}
