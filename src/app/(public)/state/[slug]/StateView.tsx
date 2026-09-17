"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { ListPageShell, type TimeFilter, type TypeFilter, type SortOrder } from "@/components/ListPageShell";
import { MapPin } from "lucide-react";

const PER_PAGE = 12;

export default function StateView() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [data, setData] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("new");

  useEffect(() => {
    setData(null);
    setPage(1);
    if (slug) publicApi.stateArticles(slug as string).then((r) => setData(r.data));
  }, [slug]);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data)).catch(() => {});
  }, []);

  // stateArticles() returns the full list in one shot (no server-side
  // pagination/sort/filter params confirmed) — filter/sort/paginate
  // client-side over what's already fetched.
  const filtered = useMemo(() => {
    let list: any[] = data?.articles || [];
    if (timeFilter !== "all") {
      const now = Date.now();
      const maxAgeMs = timeFilter === "today" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      list = list.filter((a) => a.publishedAt && now - new Date(a.publishedAt).getTime() <= maxAgeMs);
    }
    if (typeFilter !== "all") {
      list = list.filter((a) => (typeFilter === "photo" ? !!a.thumbnailUrl : !a.thumbnailUrl));
    }
    if (sort === "old") list = [...list].sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
    else if (sort === "read") list = [...list].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    else list = [...list].sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    return list;
  }, [data, timeFilter, typeFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetToPage1 = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

  if (!data) return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] text-tx-3 pb-3.5">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span className="text-line-2">›</span>
        <span className="text-tx font-medium">{data.state.nameHindi || data.state.name}</span>
      </div>

      <ListPageShell
        title={data.state.nameHindi || data.state.name}
        resultCount={filtered.length}
        timeFilter={timeFilter} onTimeFilterChange={resetToPage1(setTimeFilter)}
        typeFilter={typeFilter} onTypeFilterChange={resetToPage1(setTypeFilter)}
        sort={sort} onSortChange={resetToPage1(setSort)}
        onClearFilters={() => { setTimeFilter("all"); setTypeFilter("all"); setPage(1); }}
        totalPages={totalPages} page={page} onPageChange={setPage}
      >
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((a: any) => <NewsCard key={a.id} {...a} />)}
          </div>
        ) : (
          <p className="text-center text-tx-3 py-12">{isHindi ? "इस राज्य के लिए कोई लेख नहीं" : "No articles for this state"}</p>
        )}
      </ListPageShell>

      {states.length > 0 && (
        <div className="bg-panel border border-line rounded-lg p-4 mt-3.5">
          <h3 className="font-semibold text-xs uppercase tracking-wide text-tx-3 mb-3">{isHindi ? "अन्य राज्य" : "Other States"}</h3>
          <div className="flex flex-wrap gap-2">
            {states.map((s) => (
              <Link key={s.id} href={`/state/${s.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${s.slug === slug ? "bg-brand-soft text-brand border-brand" : "text-tx-2 border-line hover:border-brand hover:text-tx"}`}>
                {isHindi ? (s.nameHindi || s.name) : s.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
