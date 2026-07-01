"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { NewsCard } from "./NewsCard";

interface RelatedArticlesProps {
  categoryId: number;
  currentArticleId: number;
}

export function RelatedArticles({ categoryId, currentArticleId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    publicApi.articles({ categoryId, limit: 4 })
      .then((r) => setArticles(r.data.items.filter((a: any) => a.id !== currentArticleId).slice(0, 3)))
      .catch(() => {});
  }, [categoryId, currentArticleId]);

  if (articles.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t">
      <h3 className="text-xl font-bold mb-4">संबंधित खबरें</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a) => (
          <NewsCard key={a.id} {...a} size="sm" />
        ))}
      </div>
    </div>
  );
}
