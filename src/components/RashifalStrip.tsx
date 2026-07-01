"use client";

import Link from "next/link";
import { useSite } from "@/lib/site-context";
import { ChevronRight } from "lucide-react";

const RASHI_LIST = [
  { slug: "mesh", name: "Aries", nameHindi: "मेष", symbol: "♈" },
  { slug: "vrishabh", name: "Taurus", nameHindi: "वृषभ", symbol: "♉" },
  { slug: "mithun", name: "Gemini", nameHindi: "मिथुन", symbol: "♊" },
  { slug: "kark", name: "Cancer", nameHindi: "कर्क", symbol: "♋" },
  { slug: "singh", name: "Leo", nameHindi: "सिंह", symbol: "♌" },
  { slug: "kanya", name: "Virgo", nameHindi: "कन्या", symbol: "♍" },
  { slug: "tula", name: "Libra", nameHindi: "तुला", symbol: "♎" },
  { slug: "vrishchik", name: "Scorpio", nameHindi: "वृश्चिक", symbol: "♏" },
  { slug: "dhanu", name: "Sagittarius", nameHindi: "धनु", symbol: "♐" },
  { slug: "makar", name: "Capricorn", nameHindi: "मकर", symbol: "♑" },
  { slug: "kumbh", name: "Aquarius", nameHindi: "कुंभ", symbol: "♒" },
  { slug: "meen", name: "Pisces", nameHindi: "मीन", symbol: "♓" },
];

export function RashifalStrip() {
  const { isHindi } = useSite();

  return (
    <section className="bg-white rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-(--line)">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full bg-brand" />
          <h2 className="text-lg font-black text-gray-900">🔮 {isHindi ? "आज का राशिफल" : "Today's Horoscope"}</h2>
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
