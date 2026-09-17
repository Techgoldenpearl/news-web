"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { ListPageShell, type TimeFilter, type TypeFilter, type SortOrder } from "@/components/ListPageShell";
import { normalizeSearchArticle } from "@/types";

const PER_PAGE = 12;

function SearchContent() {
  const searchParams = useSearchParams();
  const { isHindi } = useSite();
  const q = searchParams.get("q") || "";
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("new");

  useEffect(() => {
    setPage(1);
    if (q.length >= 2) {
      setLoading(true);
      // search() takes no sort/filter params (unconfirmed server-side
      // support) — filter/sort client-side over the returned result set.
      publicApi.search(q)
        .then((r) => setArticles((r.data.items || []).map(normalizeSearchArticle)))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    } else {
      setArticles([]);
    }
  }, [q]);

  const filtered = useMemo(() => {
    let list = [...articles];
    if (timeFilter !== "all") {
      const now = Date.now();
      const maxAgeMs = timeFilter === "today" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      list = list.filter((a) => a.publishedAt && now - new Date(a.publishedAt).getTime() <= maxAgeMs);
    }
    if (typeFilter !== "all") {
      list = list.filter((a) => (typeFilter === "photo" ? !!a.thumbnailUrl : !a.thumbnailUrl));
    }
    if (sort === "old") list.sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
    else if (sort === "read") list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    else list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    return list;
  }, [articles, timeFilter, typeFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const resetToPage1 = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

  return (
    <ListPageShell
      title={`${isHindi ? "खोज परिणाम" : "Search"}: "${q}"`}
      resultCount={q.length >= 2 ? filtered.length : undefined}
      timeFilter={timeFilter} onTimeFilterChange={resetToPage1(setTimeFilter)}
      typeFilter={typeFilter} onTypeFilterChange={resetToPage1(setTypeFilter)}
      sort={sort} onSortChange={resetToPage1(setSort)}
      onClearFilters={() => { setTimeFilter("all"); setTypeFilter("all"); setPage(1); }}
      totalPages={q.length >= 2 ? totalPages : undefined}
      page={page} onPageChange={setPage}
      loading={loading}
    >
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((a) => <NewsCard key={a.id} {...a} />)}
        </div>
      ) : (
        !loading && q.length >= 2 && (
          <p className="text-center text-tx-3 py-12">{isHindi ? "कोई परिणाम नहीं मिला" : "No results found"}</p>
        )
      )}
      {!loading && q.length > 0 && q.length < 2 && (
        <p className="text-center text-tx-3 py-12">{isHindi ? "कम से कम 2 अक्षर लिखें" : "Type at least 2 characters"}</p>
      )}
    </ListPageShell>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
