"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { useUI } from "@/lib/ui-context";
import type { Tag } from "@/types";

export function SearchOverlay() {
  const { isHindi } = useSite();
  const { searchOpen, closeSearch } = useUI();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQ("");
      inputRef.current?.focus();
      // No dedicated "trending topics" endpoint is confirmed — the tag list
      // is a reasonable stand-in for "currently in discussion" chips.
      publicApi.tags().then((r) => setTags((r.data || []).slice(0, 10))).catch(() => {});
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  if (!searchOpen) return null;

  const submit = (query: string) => {
    if (!query.trim()) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="search-overlay-backdrop" onClick={closeSearch}>
      <div
        className="max-w-[640px] mx-auto bg-panel rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); submit(q); }}
          className="flex items-center gap-2.5 px-4 border-b border-line"
        >
          <Search size={18} className="text-tx-3 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isHindi ? "वार्ड, नेता या विषय लिखें" : "Search topics, places, people"}
            className="flex-1 border-0 bg-transparent font-inherit text-[17px] py-4 text-tx outline-none min-w-0"
          />
          <button type="button" onClick={closeSearch} aria-label={isHindi ? "बंद करें" : "Close"} className="text-[11.5px] text-tx-3 border border-line rounded px-1.5 py-0.5">
            Esc
          </button>
        </form>
        {tags.length > 0 && (
          <div className="px-4 pt-3.5 pb-4">
            <div className="text-xs text-tx-3 mb-2.5">{isHindi ? "अभी चर्चा में" : "Trending now"}</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => submit(isHindi ? (t.nameHindi || t.name) : t.name)}
                  className="text-sm border border-line rounded-full px-3.5 py-1.5 text-tx-2 hover:border-brand hover:text-tx transition"
                >
                  {isHindi ? (t.nameHindi || t.name) : t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
