"use client";

import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";
import { CategoryTopAd } from "@/components/AdUnit";
import { AdSlot } from "@/components/AdSlot";
import { useSite } from "@/lib/site-context";

export default function CategoryView() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      setCategory(null);
      setArticles([]);
      setPage(1);
      setHasMore(false);
      publicApi.category(slug as string).then((r) => setCategory(r.data)).catch(() => {});
      publicApi.articles({ categorySlug: slug, page: 1, limit: 12 }).then((r) => {
        setArticles(r.data.items);
        setHasMore(r.data.hasMore);
      }).catch(() => {});
    }
  }, [slug]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !slug) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const r = await publicApi.articles({ categorySlug: slug, page: nextPage, limit: 12 });
      setArticles((prev) => [...prev, ...r.data.items]);
      setHasMore(r.data.hasMore);
      setPage(nextPage);
    } catch {}
    setLoadingMore(false);
  }, [slug, page, loadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {category && (
        <div className="mb-2 pb-3 border-b-2" style={{ borderColor: category.color || "var(--accent)" }}>
          <h1 className="text-3xl font-bold" style={{ color: category.color }}>
            {isHindi ? (category.nameHindi || category.name) : category.name}
          </h1>
          {category.description && <p className="text-gray-500 mt-1">{category.description}</p>}
        </div>
      )}

      <CategoryTopAd />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        <div className="lg:col-span-3">
          <div className={`grid grid-cols-1 ${articles.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
            {articles.map((a, i) => (
              <Fragment key={a.id}>
                <NewsCard {...a} size={articles.length === 1 ? "lg" : "md"} />
                {(i + 1) % 6 === 0 && (
                  <div className="md:col-span-2">
                    <AdSlot zone="category-top" className="w-full max-w-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {articles.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "इस श्रेणी में कोई लेख नहीं" : "No articles in this category"}</p>}

          <div ref={observerRef} className="py-8 text-center">
            {loadingMore && <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-brand mx-auto" />}
            {!hasMore && articles.length >= 6 && <p className="text-gray-400 text-sm">{isHindi ? "और कोई लेख नहीं" : "No more articles"}</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>
    </div>
  );
}
