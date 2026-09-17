"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { NewsCard } from "@/components/NewsCard";
import { CompactNewsCard } from "@/components/CompactNewsCard";
import { CategoryBlock } from "@/components/CategoryBlock";
import { LocalNewsBlock } from "@/components/LocalNewsBlock";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { TrendingChipsScroller } from "@/components/TrendingChipsScroller";
import { StateNewsTabs } from "@/components/StateNewsTabs";
import { HeroSkeleton, BlockSkeleton } from "@/components/SectionSkeleton";
import Link from "next/link";
import { Play, ImageIcon, Flame, Megaphone } from "lucide-react";
import { SidebarAd } from "@/components/AdUnit";
import { dedupeCategories } from "@/lib/categories";
import type { Category, Tag } from "@/types";

export default function HomePage() {
  const { site, isHindi } = useSite();
  const [featured, setFeatured] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [heroLiveUpdates, setHeroLiveUpdates] = useState<{ time: string; text: string }[]>([]);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setFeatured([]); setLatest([]); setTrending([]); setVideos([]); setGalleries([]); setStories([]);
    publicApi.articles({ isFeatured: "true", limit: 5 }).then((r) => setFeatured(r.data.items)).catch(() => {});
    publicApi.articles({ limit: 8, page: 1 }).then((r) => setLatest(r.data.items)).catch(() => {}).finally(() => setLoading(false));
    publicApi.articles({ isTrending: "true", limit: 8 }).then((r) => setTrending(r.data.items)).catch(() => {});
    publicApi.categories().then((r) => {
      const visible = (r.data as Category[]).filter((c) => c.showInNav);
      setCategories(dedupeCategories(visible, site?.id));
    }).catch(() => {});
    publicApi.articles({ contentType: "video", limit: 10 }).then((r) => setVideos(r.data.items)).catch(() => {});
    publicApi.photoGalleries({ limit: 8 }).then((r) => setGalleries(r.data)).catch(() => {});
    publicApi.webStories({ limit: 10 }).then((r) => setStories(r.data)).catch(() => {});
    publicApi.tags().then((r) => setTags((r.data || []).slice(0, 8))).catch(() => {});
    publicApi.liveBlogsFeed(6).then((r) => setLiveFeed(r.data || [])).catch(() => {});
  }, [site]);

  // Hero pulls from featured (falls back to latest when featured is empty).
  // Track its id so the Latest News section below never repeats it.
  const { heroArticle, heroUsedIds } = useMemo(() => {
    if (featured.length === 0 && latest.length === 0) {
      return { heroArticle: null as any, heroUsedIds: new Set<string>() };
    }
    const hero = featured[0] ?? latest[0];
    return { heroArticle: hero, heroUsedIds: new Set([hero.id]) };
  }, [featured, latest]);

  // Hero's "live updates" bullet list. There's no "hasLiveBlog" flag on
  // the article list response, so this just asks the live-blog endpoint
  // directly for the hero article — it returns null when none exists,
  // same one cheap request either way.
  useEffect(() => {
    if (!heroArticle?.id) { setHeroLiveUpdates([]); return; }
    publicApi.liveBlog(heroArticle.id)
      .then((r) => {
        const entries = r.data?.entries || [];
        setHeroLiveUpdates(
          entries.slice(0, 2).map((e: any) => ({
            time: formatRelativeTime(e.postedAt, isHindi),
            text: isHindi ? (e.contentHindi || e.content) : e.content,
          }))
        );
      })
      .catch(() => setHeroLiveUpdates([]));
  }, [heroArticle?.id, isHindi]);

  // Trending is a distinct pool (isTrending=true) but can legitimately overlap
  // with whatever the hero/side panel already picked from featured/latest —
  // skip anything already shown there.
  const visibleTrending = useMemo(
    () => trending.filter((a) => !heroUsedIds.has(a.id)),
    [trending, heroUsedIds]
  );

  const latestExcludingHero = useMemo(() => {
    const trendingIds = new Set(visibleTrending.map((a) => a.id));
    return latest.filter((a) => !heroUsedIds.has(a.id) && !trendingIds.has(a.id));
  }, [latest, heroUsedIds, visibleTrending]);

  // Live-updates feed: skip the hero (it already shows as its own big live card).
  const visibleLiveFeed = useMemo(
    () => liveFeed.filter((b) => !heroUsedIds.has(b.articleId)),
    [liveFeed, heroUsedIds]
  );

  // Shared, mutable set of article ids already shown on the page (hero, side panel,
  // trending). Each CategoryBlock filters against it and adds its own picks, so the
  // same article never appears twice across the stacked category sections below.
  // This must stay ONE stable Set instance for the page's lifetime: CategoryBlock
  // mutates it directly, and re-creating it (e.g. via useMemo keyed on async data)
  // would wipe out picks earlier blocks already registered.
  const categoryShownIdsRef = useRef<Set<number>>(new Set());
  for (const id of heroUsedIds) categoryShownIdsRef.current.add(Number(id));
  for (const a of visibleTrending) categoryShownIdsRef.current.add(a.id);
  for (const b of visibleLiveFeed) categoryShownIdsRef.current.add(b.articleId);
  const categoryShownIds = categoryShownIdsRef.current;

  // The video carousel fetches independently of hero/trending/latest, so an
  // article that's e.g. both a video and trending would otherwise render
  // twice. Filter it against everything already placed above it. (Plain
  // filter, not useMemo — categoryShownIds is a mutable ref, not reactive
  // state, so it can't be trusted as a memo dependency.)
  const visibleVideos = videos.filter((v) => !categoryShownIds.has(v.id));

  if (loading) {
    return (
      <div className="space-y-3.5">
        <HeroSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <TrendingChipsScroller tags={tags} />

      {/* HERO: full-width big feature, matching the live-updates cards below it */}
      {heroArticle ? (
        <section>
          <NewsCard {...heroArticle} size="lg" liveUpdates={heroLiveUpdates} />
        </section>
      ) : (
        <section className="bg-panel border border-line rounded-lg p-10 text-center">
          <p className="text-sm text-tx-3">{isHindi ? "अभी कोई खबर उपलब्ध नहीं है।" : "No news available right now."}</p>
        </section>
      )}

      {/* LIVE UPDATES — feed mixing the single most-recently-updated live-blog
          story (gets the LIVE badge + update bullets) with plain news cards
          for the rest, matching how a real live-updates rail only flags the
          one story that's actually still breaking rather than badging every
          card that technically has a live blog attached. */}
      {visibleLiveFeed.length > 0 && (
        <section className="flex flex-col gap-3.5">
          {visibleLiveFeed.map((b, i) => (
            <NewsCard
              key={b.articleId}
              id={b.articleId}
              title={b.title}
              titleHindi={b.titleHindi}
              slug={b.slug}
              summary={b.summary}
              thumbnailUrl={b.thumbnailUrl}
              categoryName={b.categoryName}
              categoryNameHindi={b.categoryNameHindi}
              publishedAt={b.publishedAt}
              contentType={b.contentType}
              isBreaking={i === 0}
              liveUpdates={i === 0 ? b.entries.map((e: any) => ({
                time: formatRelativeTime(e.postedAt, isHindi),
                text: isHindi ? (e.contentHindi || e.content) : e.content,
              })) : undefined}
            />
          ))}
        </section>
      )}

      {/* Self-promo house ad */}
      <div className="bg-gradient-to-r from-[#fdeadb] to-[#fff6ee] border border-[#f3ddcb] rounded-lg px-4 py-3.5 flex items-center gap-3.5 flex-wrap">
        <span className="w-11 h-11 rounded-lg bg-brand text-white grid place-items-center shrink-0"><Megaphone size={20} /></span>
        <span className="text-right">
          <b className="block font-serif text-lg font-normal text-[#3b2a1e]">{isHindi ? "अपना विज्ञापन यहाँ दें" : "Advertise here"}</b>
          <span className="text-sm text-[#7a5b45]">{isHindi ? "रोज़ हज़ारों पाठकों तक पहुँचें" : "Reach thousands of readers daily"}</span>
        </span>
        <Link href="/advertiser/login" className="ml-auto bg-brand text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:brightness-95 transition whitespace-nowrap">
          {isHindi ? "पैकेज देखें" : "View Packages"}
        </Link>
      </div>

      {/* TRENDING — full width, numbered grid */}
      {visibleTrending.length > 0 && (
        <section className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-line">
            <Flame size={18} className="text-brand" />
            <h2 className="font-serif text-xl">{isHindi ? "ट्रेंडिंग" : "Trending"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
            {visibleTrending.map((a, i) => (
              <Link key={a.id} href={`/article/${a.slug}`} className="flex items-start gap-2.5 group rounded-lg p-1 -m-1 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 hover:bg-panel-2 transition-colors">
                <span className="text-brand font-mono font-bold text-lg leading-none shrink-0 w-6 text-center">{i + 1}</span>
                <p className="text-sm font-semibold text-tx leading-snug line-clamp-2">
                  {isHindi ? (a.titleHindi || a.title) : a.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* राज्यवार खबरें — clickable state tabs */}
      <StateNewsTabs />

      {/* तस्वीरों में खबर — 9:16 photo reels */}
      {galleries.length > 0 && (
        <section className="bg-panel border border-line rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-line">
            <span className="w-[42px] h-[42px] rounded-full bg-[#efede8] grid place-items-center text-[19px] shrink-0"><ImageIcon size={19} /></span>
            <h2 className="font-serif text-xl leading-tight">{isHindi ? "तस्वीरों में खबर" : "News in Pictures"}</h2>
            <Link href="/photo-gallery" className="ml-auto border border-brand text-brand rounded-md px-3.5 py-1.5 text-sm font-medium hover:bg-brand hover:text-white transition whitespace-nowrap">
              {isHindi ? "सभी देखें" : "View All"}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto p-4 sm:p-5 scrollbar-thin">
            {galleries.map((g) => (
              <Link key={g.id} href={`/photo-gallery/${g.slug}`} className="group shrink-0 w-[150px] aspect-[9/16] rounded-lg overflow-hidden relative bg-panel-2">
                {g.thumbnailUrl ? (
                  <Image src={g.thumbnailUrl} alt={isHindi ? (g.titleHindi || g.title) : g.title} fill sizes="150px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-panel-2 to-line" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="text-white text-[13px] font-semibold line-clamp-3 leading-tight">{isHindi ? (g.titleHindi || g.title) : g.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LATEST NEWS — excludes whatever the hero/side panel already showed above */}
      {latestExcludingHero.length > 0 && (
        <section className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-line">
            <div className="w-1 h-6 rounded-full bg-brand" />
            <h2 className="font-serif text-xl">{isHindi ? "ताज़ा खबरें" : "Latest News"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            {latestExcludingHero.map((a) => <CompactNewsCard key={a.id} {...a} />)}
          </div>
        </section>
      )}

      <SidebarAd position="top" className="bg-panel border border-line rounded-lg p-3" />

      {/* LOCAL NEWS — based on detected/selected city */}
      <LocalNewsBlock />

      {/* CATEGORY BLOCKS — stacked sections */}
      {categories.map((c, i) => (
        <Fragment key={c.id}>
          <CategoryBlock
            categorySlug={c.slug}
            categoryName={c.name}
            categoryNameHindi={c.nameHindi}
            categoryColor={c.color}
            shownArticleIds={categoryShownIds}
          />
          {(i + 1) % 4 === 0 && <SidebarAd position="middle" className="bg-panel border border-line rounded-lg p-3" />}
        </Fragment>
      ))}

      {/* VIDEO CAROUSEL */}
      {visibleVideos.length > 0 && (
        <ScrollCarousel title={isHindi ? "वीडियो न्यूज़" : "Video News"} viewMoreHref="/video" viewMoreLabel={isHindi ? "और देखें" : "View More"}>
          {visibleVideos.map((v) => (
            <Link key={v.id} href={`/article/${v.slug}`} className="group shrink-0 w-64">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-panel-2">
                {v.thumbnailUrl ? (
                  <Image src={v.thumbnailUrl} alt={v.title} fill sizes="256px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-panel-2 to-line" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition">
                    <Play size={18} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium mt-2 line-clamp-2 text-tx">
                {isHindi ? (v.titleHindi || v.title) : v.title}
              </p>
            </Link>
          ))}
        </ScrollCarousel>
      )}

      {/* WEB STORIES STRIP */}
      {stories.length > 0 && (
        <ScrollCarousel title={isHindi ? "वेब स्टोरीज़" : "Web Stories"} viewMoreHref="/web-stories" viewMoreLabel={isHindi ? "और देखें" : "View More"}>
          {stories.map((s) => (
            <Link key={s.id} href={`/web-stories/${s.slug}`} className="group shrink-0 w-40">
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-panel-2 shadow-sm">
                {s.thumbnailUrl ? (
                  <Image src={s.thumbnailUrl} alt={s.title} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-panel-2 to-line" />
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
    </div>
  );
}
