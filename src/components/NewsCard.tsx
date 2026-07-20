"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useSite } from "@/lib/site-context";
import { Play } from "lucide-react";

interface NewsCardProps {
  title: string;
  titleHindi?: string;
  slug: string;
  summary?: string;
  summaryHindi?: string;
  thumbnailUrl?: string;
  categoryName?: string;
  categoryNameHindi?: string;
  categorySlug?: string;
  categoryColor?: string;
  publishedAt?: string;
  isBreaking?: boolean;
  isTrending?: boolean;
  viewsCount?: number;
  contentType?: string;
  size?: "sm" | "md" | "lg";
}

export function NewsCard({ title, titleHindi, slug, summary, summaryHindi, thumbnailUrl, categoryName, categoryNameHindi, categorySlug, categoryColor, publishedAt, isBreaking, contentType, size = "md" }: NewsCardProps) {
  const { isHindi } = useSite();
  const displayTitle = isHindi ? (titleHindi || title) : title;
  const displaySummary = isHindi ? (summaryHindi || summary) : summary;
  const displayCategory = isHindi ? (categoryNameHindi || categoryName) : categoryName;

  return (
    <Link href={`/article/${slug}`} className="group block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition h-full flex flex-col">
        <div className={`relative overflow-hidden bg-gray-100 shrink-0 ${size === "lg" ? "aspect-[16/9]" : size === "sm" ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400 text-xs font-medium px-2 text-center line-clamp-3">{displayCategory || (isHindi ? "समाचार" : "News")}</span>
            </div>
          )}
          {contentType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition">
                <Play size={18} className="text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
          {isBreaking && (
            <span className="absolute top-2 left-2 bg-breaking text-white text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide animate-pulse">
              {isHindi ? "ब्रेकिंग" : "BREAKING"}
            </span>
          )}
          {displayCategory && (
            <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded font-medium"
              style={{ backgroundColor: categoryColor || "var(--accent)" }}>
              {displayCategory}
            </span>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className={`font-semibold text-gray-900 group-hover:text-brand transition line-clamp-2 ${size === "lg" ? "text-xl leading-tight" : size === "sm" ? "text-sm leading-snug" : "text-base leading-snug"}`}>
            {displayTitle}
          </h3>
          {displaySummary && size !== "sm" && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{displaySummary}</p>
          )}
          {publishedAt && (
            <p className="text-xs text-gray-400 mt-auto pt-2">{format(new Date(publishedAt), "dd MMM yyyy, h:mm a")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
