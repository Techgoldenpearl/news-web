"use client";

import Link from "next/link";
import Image from "next/image";
import { useSite } from "@/lib/site-context";
import { Play } from "lucide-react";

interface CompactNewsCardProps {
  title: string;
  titleHindi?: string;
  slug: string;
  thumbnailUrl?: string;
  contentType?: string;
  isBreaking?: boolean;
}

export function CompactNewsCard({ title, titleHindi, slug, thumbnailUrl, contentType, isBreaking }: CompactNewsCardProps) {
  const { isHindi } = useSite();
  const displayTitle = isHindi ? (titleHindi || title) : title;

  return (
    <Link href={`/article/${slug}`} className="group flex gap-3 items-start rounded-lg p-1 -m-1 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 hover:bg-gray-50 transition-colors">
      <div className="relative w-20 h-16 sm:w-24 sm:h-[72px] shrink-0 rounded-md overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={displayTitle} fill loading="lazy" sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        {contentType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
              <Play size={11} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
        {isBreaking && <span className="absolute top-0.5 left-0.5 bg-breaking text-white text-[9px] px-1 rounded font-bold">{isHindi ? "ब्रेकिंग" : "LIVE"}</span>}
      </div>
      <p className="text-sm font-medium text-gray-800 line-clamp-3 leading-snug">
        {displayTitle}
      </p>
    </Link>
  );
}
