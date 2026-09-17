"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useSite } from "@/lib/site-context";
import type { Tag } from "@/types";

export function TrendingChipsScroller({ tags }: { tags: Tag[] }) {
  const { isHindi } = useSite();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  if (tags.length === 0) return null;

  const scroll = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="flex items-center gap-2.5 bg-panel border border-line rounded-lg px-3 py-2.5">
      <span className="text-[12.5px] font-semibold text-brand shrink-0">{isHindi ? "ट्रेंडिंग" : "Trending"}</span>
      <button onClick={() => scroll(-260)} aria-label="previous" className="w-7 h-7 rounded-full bg-panel-2 text-tx-2 shrink-0 grid place-items-center hover:bg-line hover:text-tx transition">
        <ChevronLeft size={14} />
      </button>
      <div ref={ref} className="chip-scroller flex-1">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`/search?q=${encodeURIComponent(isHindi ? (t.nameHindi || t.name) : t.name)}`)}
            className="whitespace-nowrap flex items-center gap-1.5 text-[14.5px] font-medium border border-line rounded-full px-3.5 py-1.5 text-tx-2 hover:border-brand hover:text-tx transition"
          >
            {isHindi ? (t.nameHindi || t.name) : t.name}
            <span className="text-tx-3 text-xs">›</span>
          </button>
        ))}
      </div>
      <button onClick={() => scroll(260)} aria-label="next" className="w-7 h-7 rounded-full bg-panel-2 text-tx-2 shrink-0 grid place-items-center hover:bg-line hover:text-tx transition">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
