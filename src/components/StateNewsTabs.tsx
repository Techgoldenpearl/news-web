"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import type { State, Article } from "@/types";
import Link from "next/link";
import { MapPin } from "lucide-react";

export function StateNewsTabs() {
  const { isHindi } = useSite();
  const [states, setStates] = useState<State[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    publicApi.states().then((r) => {
      const list: State[] = r.data || [];
      setStates(list);
      if (list.length) setActive(list[0].slug);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    publicApi.stateArticles(active)
      .then((r) => setArticles(r.data?.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [active]);

  if (states.length === 0) return null;
  const activeState = states.find((s) => s.slug === active);

  return (
    <section className="bg-panel border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-line bg-panel-2">
        <span className="w-[42px] h-[42px] rounded-full bg-[#efede8] grid place-items-center text-[19px] shrink-0"><MapPin size={19} /></span>
        <h2 className="font-serif text-xl leading-tight">{isHindi ? "राज्यवार खबरें" : "State-wise News"}</h2>
        {activeState && (
          <Link href={`/state/${activeState.slug}`} className="ml-auto border border-brand text-brand rounded-md px-3.5 py-1.5 text-sm font-medium hover:bg-brand hover:text-white transition whitespace-nowrap">
            {isHindi ? `${activeState.nameHindi || activeState.name} की सभी खबरें` : `All ${activeState.name} news`}
          </Link>
        )}
      </div>
      <div className="chip-scroller px-3.5 py-1 border-b border-line">
        {states.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.slug)}
            aria-pressed={active === s.slug}
            className={`whitespace-nowrap text-[15px] font-medium px-3.5 py-2.5 border-b-2 transition ${active === s.slug ? "text-tx border-brand" : "text-tx-2 border-transparent hover:text-tx"}`}
          >
            {isHindi ? (s.nameHindi || s.name) : s.name}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-tx-3 text-sm">{isHindi ? "लोड हो रहा है…" : "Loading…"}</div>
        ) : articles.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(0, 6).map((a) => <NewsCard key={a.id} {...a} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-tx-3 text-sm">{isHindi ? "इस राज्य की खबरें जल्द" : "News for this state coming soon"}</div>
        )}
      </div>
    </section>
  );
}
