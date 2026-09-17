"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { ListPageShell, type TimeFilter, type TypeFilter, type SortOrder } from "@/components/ListPageShell";

const PER_PAGE = 12;

export default function LatestNewsPage() {
  const { site, isHindi, loading: siteLoading } = useSite();
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("new");

  useEffect(() => {
    if (siteLoading) return;
    setLoading(true);
    const sortParam = sort === "read" ? "views" : sort === "old" ? "oldest" : undefined;
    publicApi.articles({ page, limit: PER_PAGE, sort: sortParam })
      .then((r) => { setArticles(r.data.items || []); setTotal(r.data.total ?? 0); })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [page, site?.id, siteLoading, sort]);

  const filtered = articles.filter((a) => {
    if (typeFilter === "photo" && !a.thumbnailUrl) return false;
    if (typeFilter === "text" && a.thumbnailUrl) return false;
    if (timeFilter !== "all" && a.publishedAt) {
      const ageMs = Date.now() - new Date(a.publishedAt).getTime();
      const maxAgeMs = timeFilter === "today" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      if (ageMs > maxAgeMs) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const resetToPage1 = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

  return (
    <ListPageShell
      title={isHindi ? "ताज़ा खबरें" : "Latest News"}
      subtitle={isHindi ? "सबसे नई खबरें सबसे पहले" : "Newest stories first"}
      resultCount={total}
      timeFilter={timeFilter} onTimeFilterChange={resetToPage1(setTimeFilter)}
      typeFilter={typeFilter} onTypeFilterChange={resetToPage1(setTypeFilter)}
      sort={sort} onSortChange={resetToPage1(setSort)}
      onClearFilters={() => { setTimeFilter("all"); setTypeFilter("all"); setPage(1); }}
      totalPages={totalPages} page={page} onPageChange={setPage}
      loading={loading}
    >
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => <NewsCard key={a.id} {...a} />)}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-tx-3 py-12">{isHindi ? "अभी कोई खबर उपलब्ध नहीं है" : "No news available right now"}</p>
        )
      )}
    </ListPageShell>
  );
}
