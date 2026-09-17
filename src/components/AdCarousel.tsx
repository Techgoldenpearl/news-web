"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import type { AdZone } from "./AdSlot";

interface AdCarouselProps {
  zone: AdZone;
  className?: string;
  /** Milliseconds between auto-advances. */
  intervalMs?: number;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("_ad_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_ad_sid", sid);
  }
  return sid;
}

function detectDevice(): "desktop" | "mobile" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

/**
 * Auto-sliding ad carousel: fetches every active ad for a zone and cycles
 * through them, sliding right-to-left. Falls back to rendering nothing if
 * the zone has zero or one eligible ad (a one-item "carousel" would just
 * be a static AdSlot — use that instead for single-ad placements).
 */
export function AdCarousel({ zone, className, intervalMs = 5000 }: AdCarouselProps) {
  const { isHindi } = useSite();
  const containerRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    publicApi.adList(zone, detectDevice())
      .then((r) => setAds(r.data.items || []))
      .catch(() => {});
  }, [isVisible, zone]);

  // Auto-advance
  useEffect(() => {
    if (ads.length < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [ads.length, paused, intervalMs]);

  // Fire an impression once per ad, when it becomes the visible slide
  useEffect(() => {
    const ad = ads[index];
    if (!ad || impressionFired.current.has(ad.id)) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.5 && !impressionFired.current.has(ad.id)) {
          impressionFired.current.add(ad.id);
          publicApi.adImpression(ad.id, getSessionId()).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ads, index]);

  const handleClick = useCallback((ad: any) => {
    publicApi.adClick(ad.id, getSessionId()).catch(() => {});
  }, []);

  if (!isVisible || ads.length === 0) {
    return <div ref={containerRef} style={{ minHeight: 1 }} aria-hidden="true" />;
  }

  // A single ad doesn't need slider chrome (dots, transform track) — render
  // it plainly, same visual treatment as one slide.
  const showChrome = ads.length > 1;

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-[10px] text-gray-400 text-right mb-0.5 tracking-wide select-none">
        {isHindi ? "विज्ञापन" : "Advertisement"}
      </div>
      <div className="relative overflow-hidden rounded w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ width: `${ads.length * 100}%`, transform: `translateX(-${(index * 100) / ads.length}%)` }}
        >
          {ads.map((ad) => (
            <a
              key={ad.id}
              href={ad.linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => handleClick(ad)}
              aria-label={ad.altText || ad.name}
              className="block shrink-0"
              style={{ width: `${100 / ads.length}%` }}
            >
              {ad.type === "image" && ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt={ad.altText || ad.name}
                  loading="lazy"
                  className="w-full object-cover block"
                  style={{ height: ad.height ? `${ad.height}px` : "auto" }}
                />
              )}
            </a>
          ))}
        </div>
        {showChrome && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {ads.map((ad, i) => (
              <button
                key={ad.id}
                onClick={() => setIndex(i)}
                aria-label={`${isHindi ? "विज्ञापन" : "Ad"} ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdCarousel;
