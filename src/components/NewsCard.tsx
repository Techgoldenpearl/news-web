"use client";

import Link from "next/link";
import Image from "next/image";
import { useSite } from "@/lib/site-context";
import { useBookmark } from "@/lib/useBookmark";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";

interface NewsCardProps {
  id?: number;
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
  hasLiveBlog?: boolean;
  viewsCount?: number;
  contentType?: string;
  size?: "sm" | "md" | "lg";
  /** Recent live-blog updates to show as a bullet list under the headline. */
  liveUpdates?: { time: string; text: string }[];
}

export function NewsCard({ id, title, titleHindi, slug, summary, summaryHindi, thumbnailUrl, categoryName, categoryNameHindi, categorySlug, categoryColor, publishedAt, isBreaking, hasLiveBlog, contentType, size = "md", liveUpdates }: NewsCardProps) {
  const { isHindi } = useSite();
  const { bookmarked, toggle } = useBookmark(id);
  const displayTitle = isHindi ? (titleHindi || title) : title;
  const displaySummary = isHindi ? (summaryHindi || summary) : summary;
  const displayCategory = isHindi ? (categoryNameHindi || categoryName) : categoryName;

  return (
    <div className="group relative h-full flex flex-col rounded-xl overflow-hidden border border-line bg-panel hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/article/${slug}`} className="outline-none focus-visible:ring-2 focus-visible:ring-brand/40 flex-1 flex flex-col">
        {isBreaking && (
          <div className={`flex flex-col ${size === "lg" ? "p-4 pb-0" : "p-3 pb-0"}`}>
            <h3 className={`flex items-start gap-2 font-sans font-bold text-tx transition-colors line-clamp-2 ${size === "lg" ? "text-2xl leading-snug" : size === "sm" ? "text-base leading-snug" : "text-lg leading-snug"}`}>
              <span className="bg-live text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0 mt-1.5">
                {isHindi ? "लाइव" : "LIVE"}
              </span>
              {displayTitle}
            </h3>
            {liveUpdates && liveUpdates.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {liveUpdates.slice(0, 2).map((u, i) => (
                  <li key={i} className="flex gap-2 text-sm text-tx-2 leading-[1.7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-live shrink-0 mt-2" />
                    <span>
                      <b className="text-brand font-semibold">{u.time}:</b> {u.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className={`relative overflow-hidden bg-panel-2 shrink-0 ${isBreaking ? "mt-3" : ""} ${size === "lg" ? "aspect-[16/9]" : size === "sm" ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={displayTitle} fill loading="lazy"
              sizes={size === "lg" ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 50vw, 400px"}
              className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-panel-2 to-line">
              <span className="text-tx-3 text-xs font-medium px-2 text-center line-clamp-3">{displayCategory || (isHindi ? "समाचार" : "News")}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {contentType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition">
                <Play size={18} className="text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {hasLiveBlog && !isBreaking && (
              <span className="bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                {isHindi ? "एक्सक्लूसिव" : "EXCLUSIVE"}
              </span>
            )}
          </div>
          {displayCategory && (
            <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded font-medium"
              style={{ backgroundColor: categoryColor || "var(--accent)" }}>
              {displayCategory}
            </span>
          )}
        </div>
        {!isBreaking && (
          <div className={`flex flex-col flex-1 ${size === "lg" ? "p-4" : "p-3"}`}>
            <h3 className={`flex items-start gap-2 font-serif font-normal text-tx line-clamp-2 ${size === "lg" ? "text-2xl leading-snug" : size === "sm" ? "text-base leading-snug" : "text-lg leading-snug"}`}>
              {liveUpdates && liveUpdates.length > 0 && (
                <span className="text-live text-[11px] font-bold shrink-0 mt-1.5 tracking-wide">●&nbsp;{isHindi ? "लाइव" : "LIVE"}</span>
              )}
              {displayTitle}
            </h3>
            {liveUpdates && liveUpdates.length > 0 ? (
              <ul className="mt-2.5 space-y-1.5">
                {liveUpdates.slice(0, 2).map((u, i) => (
                  <li key={i} className="flex gap-2 text-sm text-tx-2 leading-[1.7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-live shrink-0 mt-2" />
                    <span>
                      <b className="text-brand font-semibold">{u.time}:</b> {u.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              displaySummary && size !== "sm" && (
                <p className="text-tx-3 text-sm mt-1.5 line-clamp-2 leading-relaxed">{displaySummary}</p>
              )
            )}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-2.5 px-3 pb-3 pt-1">
        {publishedAt && (
          <span className="font-mono text-[12.5px] text-tx-3">
            {formatRelativeTime(publishedAt, isHindi)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayTitle)}`}
            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            aria-label="WhatsApp" className="w-8 h-8 rounded-full grid place-items-center text-tx-3 hover:bg-panel-2 hover:text-[#25913f] transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.9 11.9 0 004.5 4 5 5 0 002.3.5 2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.2-1.2c-.1-.1-.2-.2-.4-.3z"/></svg>
          </a>
          {id != null && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
              aria-label={isHindi ? "सहेजें" : "Bookmark"}
              className={`w-8 h-8 rounded-full grid place-items-center transition ${bookmarked ? "text-brand" : "text-tx-3 hover:bg-panel-2 hover:text-tx"}`}
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
