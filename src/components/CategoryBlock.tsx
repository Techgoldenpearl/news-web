"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { CompactNewsCard } from "./CompactNewsCard";
import { NewsCard } from "./NewsCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryBlockProps {
  categorySlug: string;
  categoryName: string;
  categoryNameHindi?: string;
  categoryColor?: string;
  shownArticleIds?: Set<number>;
}

export function CategoryBlock({ categorySlug, categoryName, categoryNameHindi, categoryColor, shownArticleIds }: CategoryBlockProps) {
  const { isHindi } = useSite();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    publicApi.articles({ categorySlug, limit: 7 }).then((r) => setArticles(r.data.items)).catch(() => {});
  }, [categorySlug]);

  // Filter out articles already shown elsewhere on the page (hero, earlier category
  // blocks). Pure — no mutation during render.
  const visibleArticles = shownArticleIds ? articles.filter((a) => !shownArticleIds.has(a.id)) : articles;

  // Register this block's picks so blocks rendered after it skip them too.
  // This mutates the shared Set, so it belongs in an effect, not in render.
  useEffect(() => {
    if (!shownArticleIds) return;
    for (const a of visibleArticles) shownArticleIds.add(a.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, shownArticleIds]);

  if (visibleArticles.length === 0) return null;

  const displayName = isHindi ? (categoryNameHindi || categoryName) : categoryName;

  return (
    <section className="bg-panel border border-line rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: categoryColor || "var(--accent)" }} />
          <h2 className="font-serif text-xl">{displayName}</h2>
        </div>
        <Link href={`/category/${categorySlug}`} className="flex items-center gap-0.5 text-xs font-bold text-brand hover:opacity-80 transition uppercase tracking-wide shrink-0">
          {isHindi ? "और देखें" : "View More"} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleArticles[0] && (
          <div className="lg:col-span-1">
            <NewsCard {...visibleArticles[0]} size="md" />
          </div>
        )}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {visibleArticles.slice(1, 7).map((a) => <CompactNewsCard key={a.id} {...a} />)}
        </div>
      </div>
    </section>
  );
}
