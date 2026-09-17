"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "./NewsCard";
import type { Article } from "@/types";

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
    <div className="mt-10 pt-8 border-t border-line">
      <h3 className="font-serif text-xl mb-4">संबंधित खबरें</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a) => (
          <NewsCard key={a.id} {...a} size="sm" />
        ))}
      </div>
    </div>
  );
}

/** Single inline "यह भी पढ़ें" card, used mid-article rather than the end-of-article grid above. */
export function InlineRelatedCard({ categoryId, currentArticleId }: RelatedArticlesProps) {
  const { isHindi } = useSite();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    publicApi.articles({ categoryId, limit: 4 })
      .then((r) => {
        const found = (r.data.items || []).find((a: Article) => a.id !== currentArticleId);
        setArticle(found || null);
      })
      .catch(() => {});
  }, [categoryId, currentArticleId]);

  if (!article) return null;
  const title = isHindi ? (article.titleHindi || article.title) : article.title;

  return (
    <Link
      href={`/article/${article.slug}`}
      className="flex items-center gap-3.5 border-t border-b border-line py-3.5 my-7 group"
    >
      <span className="text-[11.5px] text-tx-3 tracking-wide shrink-0">{isHindi ? "यह भी पढ़ें" : "ALSO READ"}</span>
      {article.thumbnailUrl && (
        <span className="relative w-24 h-[66px] shrink-0 rounded-md overflow-hidden bg-panel-2 block">
          <Image src={article.thumbnailUrl} alt={title} fill sizes="96px" className="object-cover" />
        </span>
      )}
      <span className="font-serif text-lg leading-snug text-tx">{title}</span>
    </Link>
  );
}
