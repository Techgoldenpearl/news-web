"use client";

import { Fragment, useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { CompactNewsCard } from "@/components/CompactNewsCard";
import { CategoryBlock } from "@/components/CategoryBlock";
import { LocalNewsBlock } from "@/components/LocalNewsBlock";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { RashifalStrip } from "@/components/RashifalStrip";
import Link from "next/link";
import { Play, ImageIcon, Flame } from "lucide-react";
import { SidebarAd } from "@/components/AdUnit";

export default function HomePage() {
  const { site, isHindi } = useSite();
  const [featured, setFeatured] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    setFeatured([]); setLatest([]); setTrending([]); setVideos([]); setGalleries([]); setStories([]);
    publicApi.articles({ isFeatured: "true", limit: 5 }).then((r) => setFeatured(r.data.items)).catch(() => {});
    publicApi.articles({ limit: 8, page: 1 }).then((r) => setLatest(r.data.items)).catch(() => {});
    publicApi.articles({ isTrending: "true", limit: 8 }).then((r) => setTrending(r.data.items)).catch(() => {});
    publicApi.categories().then((r) => setCategories(r.data.filter((c: any) => c.showInNav))).catch(() => {});
    publicApi.articles({ contentType: "video", limit: 10 }).then((r) => setVideos(r.data.items)).catch(() => {});
    publicApi.photoGalleries({ limit: 8 }).then((r) => setGalleries(r.data)).catch(() => {});
    publicApi.webStories({ limit: 10 }).then((r) => setStories(r.data)).catch(() => {});
  }, [site]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* HERO: big feature + side items (pads from latest news when featured is short, so the panel never looks sparse) */}
      {(featured.length > 0 || latest.length > 0) && (() => {
        const heroArticle = featured[0] ?? latest[0];
        const usedIds = new Set([heroArticle.id]);
        const sideArticles: any[] = [];
        for (const a of [...featured.slice(1), ...latest]) {
          if (sideArticles.length >= 4) break;
          if (usedIds.has(a.id)) continue;
          usedIds.add(a.id);
          sideArticles.push(a);
        }
        return (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2">
              <NewsCard {...heroArticle} size="lg" />
            </div>
            {sideArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 bg-white rounded-xl border p-4">
                {sideArticles.map((a) => (
                  <CompactNewsCard key={a.id} {...a} />
                ))}
              </div>
            )}
          </section>
        );
      })()}

      {/* TRENDING — full width, numbered grid */}
      {trending.length > 0 && (
        <section className="bg-white rounded-xl border p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-(--line)">
            <Flame size={18} className="text-brand" />
            <h2 className="text-lg font-black text-gray-900">{isHindi ? "ट्रेंडिंग" : "Trending"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {trending.map((a, i) => (
              <Link key={a.id} href={`/article/${a.slug}`} className="flex items-start gap-2.5 group">
                <span className="text-brand font-black text-lg leading-none shrink-0 w-6 text-center">{i + 1}</span>
                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-brand transition">
                  {isHindi ? (a.titleHindi || a.title) : a.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LATEST NEWS */}
      <section className="bg-white rounded-xl border p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-(--line)">
          <div className="w-1 h-6 rounded-full bg-brand" />
          <h2 className="text-lg font-black text-gray-900">{isHindi ? "ताज़ा खबरें" : "Latest News"}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          {latest.map((a) => <CompactNewsCard key={a.id} {...a} />)}
        </div>
      </section>

      <SidebarAd position="top" className="bg-white rounded-xl border p-3" />

      {/* LOCAL NEWS — based on detected/selected city */}
      <LocalNewsBlock />

      {/* CATEGORY BLOCKS — stacked Bhaskar-style sections */}
      {categories.map((c, i) => (
        <Fragment key={c.id}>
          <CategoryBlock
            categorySlug={c.slug}
            categoryName={c.name}
            categoryNameHindi={c.nameHindi}
            categoryColor={c.color}
          />
          {(i + 1) % 4 === 0 && <SidebarAd position="middle" className="bg-white rounded-xl border p-3" />}
        </Fragment>
      ))}

      {/* VIDEO CAROUSEL */}
      {videos.length > 0 && (
        <ScrollCarousel title={isHindi ? "वीडियो न्यूज़" : "Video News"} viewMoreHref="/video" viewMoreLabel={isHindi ? "और देखें" : "View More"}>
          {videos.map((v) => (
            <Link key={v.id} href={`/article/${v.slug}`} className="group shrink-0 w-64">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition">
                    <Play size={18} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium mt-2 line-clamp-2 group-hover:text-brand transition">
                {isHindi ? (v.titleHindi || v.title) : v.title}
              </p>
            </Link>
          ))}
        </ScrollCarousel>
      )}

      {/* PHOTO GALLERY STRIP */}
      {galleries.length > 0 && (
        <ScrollCarousel title={isHindi ? "फोटो गैलरी" : "Photo Gallery"} viewMoreHref="/photo-gallery" viewMoreLabel={isHindi ? "और देखें" : "View More"}>
          {galleries.map((g) => (
            <Link key={g.id} href={`/photo-gallery/${g.slug}`} className="group shrink-0 w-56">
              <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
                {g.thumbnailUrl ? (
                  <img src={g.thumbnailUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold line-clamp-2">{isHindi ? (g.titleHindi || g.title) : g.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ImageIcon size={11} className="text-white/70" />
                    <span className="text-white/70 text-xs">{isHindi ? "गैलरी" : "Gallery"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </ScrollCarousel>
      )}

      {/* WEB STORIES STRIP */}
      {stories.length > 0 && (
        <ScrollCarousel title={isHindi ? "वेब स्टोरीज़" : "Web Stories"} viewMoreHref="/web-stories" viewMoreLabel={isHindi ? "और देखें" : "View More"}>
          {stories.map((s) => (
            <Link key={s.id} href={`/web-stories/${s.slug}`} className="group shrink-0 w-40">
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                {s.thumbnailUrl ? (
                  <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold line-clamp-3">{isHindi ? (s.titleHindi || s.title) : s.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </ScrollCarousel>
      )}

      {/* RASHIFAL STRIP */}
      <RashifalStrip />
    </div>
  );
}
