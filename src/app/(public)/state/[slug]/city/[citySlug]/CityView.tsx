"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { AdSlot } from "@/components/AdSlot";
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

  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span>/</span>
        <Link href={`/state/${slug}`} className="hover:text-brand">{isHindi ? (data.state.nameHindi || data.state.name) : data.state.name}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{data.city.nameHindi || data.city.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin size={26} className="text-brand" /> {isHindi ? (data.city.nameHindi || data.city.name) : data.city.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCityPickerOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand hover:border-brand transition text-sm font-medium"
              >
                {isHindi ? "शहर बदलें" : "Change City"} <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.articles.map((a: any, i: number) => (
              <Fragment key={a.id}>
                <NewsCard {...a} />
                {(i + 1) % 6 === 0 && (
                  <div className="md:col-span-2">
                    <AdSlot zone="category-top" className="w-full max-w-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {data.articles.length === 0 && <p className="text-center text-gray-500 py-12">{isHindi ? "इस शहर के लिए कोई लेख नहीं" : "No articles for this city"}</p>}
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <div className="bg-white rounded-xl border p-4 h-fit">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">
              {isHindi ? `${data.state.nameHindi || data.state.name} के अन्य शहर` : `Other cities in ${data.state.name}`}
            </h3>
            <div className="space-y-0.5">
              {cities.map((c) => (
                <Link key={c.id} href={`/state/${slug}/city/${c.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${c.slug === citySlug ? "bg-brand-tint text-brand" : "text-gray-700 hover:bg-gray-50"}`}>
                  {isHindi ? (c.nameHindi || c.name) : c.name}
                </Link>
              ))}
            </div>
          </div>
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>

      <CityPicker open={cityPickerOpen} onClose={() => setCityPickerOpen(false)} />
    </div>
  );
}
