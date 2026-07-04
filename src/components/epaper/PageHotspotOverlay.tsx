"use client";

import Link from "next/link";

interface Region {
  id: number;
  articleId: number | null;
  articleSlug: string | null;
  externalUrl: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string | null;
}

interface PageHotspotOverlayProps {
  regions: Region[];
}

export default function PageHotspotOverlay({ regions }: PageHotspotOverlayProps) {
  if (!regions || regions.length === 0) return null;

  return (
    <>
      {regions.map((r) => {
        const style = {
          left: `${r.x * 100}%`,
          top: `${r.y * 100}%`,
          width: `${r.width * 100}%`,
          height: `${r.height * 100}%`,
        };
        const className = "absolute border border-white/0 hover:border-white/70 hover:bg-white/10 transition-colors rounded-sm";

        if (r.articleSlug) {
          return <Link key={r.id} href={`/article/${r.articleSlug}`} className={className} style={style} title={r.label || undefined} />;
        }
        if (r.externalUrl) {
          return <a key={r.id} href={r.externalUrl} target="_blank" rel="noopener noreferrer" className={className} style={style} title={r.label || undefined} />;
        }
        return null;
      })}
    </>
  );
}
