"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { RailAd } from "@/components/AdUnit";
import { RashifalRailGrid } from "@/components/RashifalStrip";
import type { Article } from "@/types";

export function RightRail() {
  const { isHindi } = useSite();
  const [mostRead, setMostRead] = useState<Article[]>([]);
  const [photoOfDay, setPhotoOfDay] = useState<any>(null);

  useEffect(() => {
    // "Most Read" ranks by actual viewsCount, not the editorial isTrending
    // flag — those are different things and were previously conflated here.
    publicApi.articles({ sort: "views", limit: 6 }).then((r) => setMostRead(r.data.items || [])).catch(() => {});
    // No dedicated "photo of the day" endpoint exists — the latest photo
    // gallery's cover is a reasonable stand-in until/unless one is added.
    publicApi.photoGalleries({ limit: 1 }).then((r) => setPhotoOfDay(r.data?.[0] || null)).catch(() => {});
  }, []);

  return (
    <aside className="shell-rail pb-5">
      <div className="bg-gradient-to-r from-[#fdeadb] to-[#fff6ee] border border-[#f3ddcb] rounded-lg px-4 py-3.5 flex items-center gap-3 text-[#3b2a1e] text-sm font-semibold mb-3.5">
        <span className="flex-1">{isHindi ? "हमें Google पर पसंदीदा सोर्स बनाएं →" : "Make us your preferred source on Google →"}</span>
        <span className="bg-white rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#3c4043] border border-[#e0d5c9] whitespace-nowrap">+ Follow</span>
      </div>

      <div className="mb-3.5">
        <RailAd />
      </div>

      {photoOfDay && (
        <div className="bg-panel border border-line rounded-lg overflow-hidden mb-3.5">
          <div className="flex items-center px-4 py-3 border-b border-line">
            <h3 className="font-serif text-lg">{isHindi ? "आज की तस्वीर" : "Photo of the Day"}</h3>
            <Link href="/photo-gallery" className="ml-auto text-brand text-[13.5px]">{isHindi ? "और देखें" : "More"}</Link>
          </div>
          <Link href={`/photo-gallery/${photoOfDay.slug}`} className="block relative aspect-[16/10] bg-panel-2">
            {photoOfDay.thumbnailUrl && (
              <Image src={photoOfDay.thumbnailUrl} alt={isHindi ? (photoOfDay.titleHindi || photoOfDay.title) : photoOfDay.title} fill sizes="330px" className="object-cover" />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent text-white font-serif text-[18px] leading-tight px-4 pt-6 pb-3.5">
              {isHindi ? (photoOfDay.titleHindi || photoOfDay.title) : photoOfDay.title}
            </span>
          </Link>
        </div>
      )}

      {mostRead.length > 0 && (
        <div className="bg-panel border border-line rounded-lg overflow-hidden mb-3.5">
          <div className="flex items-center px-4 py-3 border-b border-line">
            <h3 className="font-serif text-lg">{isHindi ? "सबसे ज़्यादा पढ़ी गईं" : "Most Read"}</h3>
          </div>
          <div>
            {mostRead.map((a, i) => (
              <Link key={a.id} href={`/article/${a.slug}`} className="flex gap-2.5 px-4 py-3 border-b border-line last:border-0 hover:bg-panel-2 transition">
                <span className="font-mono text-[13px] text-brand shrink-0 w-4 pt-0.5">{i + 1}</span>
                <h4 className="text-[14.5px] font-medium leading-[1.55] line-clamp-2">
                  {isHindi ? (a.titleHindi || a.title) : a.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      <RashifalRailGrid />

      <RailAd className="min-h-[600px]" />
    </aside>
  );
}
