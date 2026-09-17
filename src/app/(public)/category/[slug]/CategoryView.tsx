"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";
import { useSite } from "@/lib/site-context";
import { ListPageShell, type TimeFilter, type TypeFilter, type SortOrder } from "@/components/ListPageShell";

const PER_PAGE = 12;

export default function CategoryView() {
  const { slug } = useParams();
  const { site, isHindi, loading: siteLoading } = useSite();
  const [category, setCategory] = useState<any>(null);
  const [categoryChecked, setCategoryChecked] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("new");

  useEffect(() => {
    // Wait for the site to resolve first — otherwise this fires before
    // X-Site-ID is set and can pull back a category from another tenant,
    // leaving the header's (site-scoped) category strip with no matching tab.
    if (slug && !siteLoading) {
      setCategory(null);
      setCategoryChecked(false);
      publicApi.category(slug as string)
        .then((r) => setCategory(r.data))
        .catch(() => setCategory(null))
        .finally(() => setCategoryChecked(true));
    }
  }, [slug, siteLoading, site?.id]);

  useEffect(() => {
    if (!slug || siteLoading) return;
    setLoading(true);
    // sort is supported server-side (categorySlug/page/limit/sort). range
    // and hasThumbnail are NOT — the backend silently ignores them — so
    // time/type filters still apply client-side below, over just the
    // current page.
    const params: Record<string, any> = { categorySlug: slug, page, limit: PER_PAGE };
    if (sort === "read") params.sort = "views";
    else if (sort === "old") params.sort = "oldest";
    publicApi.articles(params)
      .then((r) => { setArticles(r.data.items || []); setHasMore(!!r.data.hasMore); setTotal(r.data.total ?? 0); })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [slug, siteLoading, site?.id, page, sort, timeFilter, typeFilter]);

  // time/type filters have no backend support (range/hasThumbnail are
  // silently ignored server-side) — applied client-side over the current
  // page only, same compromise the other list pages make for this.
  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (typeFilter === "photo" && !a.thumbnailUrl) return false;
      if (typeFilter === "text" && a.thumbnailUrl) return false;
      if (timeFilter !== "all" && a.publishedAt) {
        const ageMs = Date.now() - new Date(a.publishedAt).getTime();
        const maxAgeMs = timeFilter === "today" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        if (ageMs > maxAgeMs) return false;
      }
      return true;
    });
  }, [articles, timeFilter, typeFilter]);

  const resetToPage1 = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

  return (
    <div>
      {categoryChecked && !category ? (
        <p className="text-center text-tx-3 py-16">
          {isHindi ? "यह श्रेणी इस साइट पर मौजूद नहीं है" : "This category doesn't exist on this site"}
        </p>
      ) : (
        <ListPageShell
          title={category ? (isHindi ? (category.nameHindi || category.name) : category.name) : ""}
          subtitle={category?.description}
          resultCount={total}
          timeFilter={timeFilter} onTimeFilterChange={resetToPage1(setTimeFilter)}
          typeFilter={typeFilter} onTypeFilterChange={resetToPage1(setTypeFilter)}
          sort={sort} onSortChange={resetToPage1(setSort)}
          onClearFilters={() => { setTimeFilter("all"); setTypeFilter("all"); setPage(1); }}
          page={page} hasMore={hasMore} onPageChange={setPage}
          loading={loading}
        >
          {filtered.length > 0 ? (
            <div className={`grid grid-cols-1 ${filtered.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""} gap-4`}>
              {filtered.map((a) => <NewsCard key={a.id} {...a} size={filtered.length === 1 ? "lg" : "md"} />)}
            </div>
          ) : (
            <p className="text-center text-tx-3 py-12">{isHindi ? "इस श्रेणी में कोई लेख नहीं" : "No articles in this category"}</p>
          )}
        </ListPageShell>
      )}
    </div>
  );
}
