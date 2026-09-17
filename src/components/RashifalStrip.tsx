"use client";

import Link from "next/link";
import { useSite } from "@/lib/site-context";
import { RASHI_LIST } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

/** Full-width, 12-column icon grid — used on wide layouts (e.g. the /rashifal page itself). */
export function RashifalStrip() {
  const { isHindi } = useSite();

  return (
    <section className="bg-panel border border-line rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full bg-brand" />
          <h2 className="font-serif text-xl">🔮 {isHindi ? "आज का राशिफल" : "Today's Horoscope"}</h2>
        </div>
        <Link href="/rashifal" className="flex items-center gap-0.5 text-xs font-bold text-brand hover:opacity-80 transition uppercase tracking-wide">
          {isHindi ? "और देखें" : "View More"} <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {RASHI_LIST.map((r) => (
          <Link key={r.slug} href={`/rashifal?rashi=${r.slug}`}
            className="flex flex-col items-center gap-1 p-2.5 rounded-lg border hover:border-brand hover:bg-brand-tint transition text-center">
            <span className="text-2xl">{r.symbol}</span>
            <span className="text-xs font-medium text-gray-700">{isHindi ? r.nameHindi : r.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Narrow icon grid sized for the right rail's fixed ~330px column. */
export function RashifalRailGrid() {
  const { isHindi } = useSite();

  return (
    <div className="bg-panel border border-line rounded-lg overflow-hidden mb-3.5">
      <div className="flex items-center px-4 py-3 border-b border-line">
        <h3 className="font-serif text-lg">🔮 {isHindi ? "आज का राशिफल" : "Today's Horoscope"}</h3>
        <Link href="/rashifal" className="ml-auto flex items-center gap-0.5 text-xs font-bold text-brand hover:opacity-80 transition">
          {isHindi ? "और देखें" : "More"} <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {RASHI_LIST.map((r) => (
          <Link key={r.slug} href={`/rashifal?rashi=${r.slug}`}
            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-line hover:border-brand hover:bg-brand-tint transition text-center">
            <span className="text-xl">{r.symbol}</span>
            <span className="text-[11px] font-medium text-gray-700 leading-tight">{isHindi ? r.nameHindi : r.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
