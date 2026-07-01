"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";

export type AdZone =
  | "header-leaderboard"
  | "breaking-below"
  | "sidebar-top"
  | "sidebar-middle"
  | "in-article-1"
  | "in-article-2"
  | "footer-banner"
  | "category-top"
  | "video-preroll"
  | "popup";

interface AdSlotProps {
  zone: AdZone;
  className?: string;
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

export function AdSlot({ zone, className }: AdSlotProps) {
  const { isHindi } = useSite();
  const containerRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ad, setAd] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // Lazy-fetch: only request the ad once the slot nears the viewport
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
    publicApi.ad(zone, detectDevice())
      .then((r) => setAd(r.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isVisible, zone]);

  // Impression: fire once when ad becomes 50% visible
  useEffect(() => {
    if (!ad || impressionFired.current) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.5 && !impressionFired.current) {
          impressionFired.current = true;
          publicApi.adImpression(ad.id, getSessionId()).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ad]);

  const handleClick = useCallback(() => {
    if (!ad) return;
    publicApi.adClick(ad.id, getSessionId()).catch(() => {});
  }, [ad]);

  if (!isVisible || (loaded && !ad) || !ad) {
    return <div ref={containerRef} style={{ minHeight: 1 }} aria-hidden="true" />;
  }

  const wrapperStyle: React.CSSProperties = {
    display: "block",
    position: "relative",
    maxWidth: ad.width ? `${ad.width}px` : "100%",
    margin: "0 auto",
  };

  let adContent: React.ReactNode = null;

  if (ad.type === "image" && ad.imageUrl) {
    adContent = (
      <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer nofollow" onClick={handleClick}
        className="block" aria-label={ad.altText || ad.name}>
        <img src={ad.imageUrl} alt={ad.altText || ad.name} loading="lazy"
          className="w-full object-cover block rounded"
          style={{ height: ad.height ? `${ad.height}px` : "auto" }} />
      </a>
    );
  } else if (ad.type === "script" && ad.htmlContent) {
    const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;">${ad.htmlContent}</body></html>`
    )}`;
    adContent = (
      <iframe src={iframeSrc} sandbox="allow-scripts" title={ad.name} onClick={handleClick}
        className="block border-0 w-full" style={{ height: ad.height ? `${ad.height}px` : "90px" }} />
    );
  } else if (ad.type === "html" && ad.htmlContent) {
    adContent = <div onClick={handleClick} dangerouslySetInnerHTML={{ __html: ad.htmlContent }} className="w-full" />;
  } else if (ad.type === "text") {
    adContent = (
      <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer nofollow" onClick={handleClick}
        className="block px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded text-gray-900 text-sm leading-snug no-underline">
        {ad.altText || ad.name}
      </a>
    );
  }

  if (!adContent) return null;

  return (
    <div ref={containerRef} className={className} style={wrapperStyle}>
      <div className="text-[10px] text-gray-400 text-right mb-0.5 tracking-wide select-none">
        {isHindi ? "विज्ञापन" : "Advertisement"}
      </div>
      {adContent}
    </div>
  );
}

export default AdSlot;
