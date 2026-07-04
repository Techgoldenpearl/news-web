"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { AdSlot } from "@/components/AdSlot";
import { MapPin } from "lucide-react";

export default function StateView() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [data, setData] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    if (slug) publicApi.stateArticles(slug as string).then((r) => setData(r.data));
  }, [slug]);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{data.state.nameHindi || data.state.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={26} className="text-brand" /> {data.state.nameHindi || data.state.name}
          </h1>
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
          {data.articles.length === 0 && <p className="text-center text-gray-500 py-12">{isHindi ? "इस राज्य के लिए कोई लेख नहीं" : "No articles for this state"}</p>}
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <div className="bg-white rounded-xl border p-4 h-fit">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">{isHindi ? "अन्य राज्य" : "Other States"}</h3>
            <div className="space-y-0.5">
              {states.map((s) => (
                <Link key={s.id} href={`/state/${s.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${s.slug === slug ? "bg-brand-tint text-brand" : "text-gray-700 hover:bg-gray-50"}`}>
                  {isHindi ? (s.nameHindi || s.name) : s.name}
                </Link>
              ))}
            </div>
          </div>
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>
    </div>
  );
}
