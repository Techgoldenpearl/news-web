"use client";

import { ReactNode } from "react";
import { useSite } from "@/lib/site-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryTopAd } from "@/components/AdUnit";

export type TimeFilter = "all" | "today" | "week";
export type TypeFilter = "all" | "photo" | "text";
export type SortOrder = "new" | "old" | "read";

interface ListPageShellProps {
  title: string;
  subtitle?: string;
  resultCount?: number;
  timeFilter: TimeFilter;
  onTimeFilterChange: (v: TimeFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (v: TypeFilter) => void;
  sort: SortOrder;
  onSortChange: (v: SortOrder) => void;
  onClearFilters: () => void;
  /** Total pages if known exactly; omit when the API only reports hasMore (next-only pager). */
  totalPages?: number;
  page: number;
  hasMore?: boolean;
  onPageChange: (page: number) => void;
  loading?: boolean;
  children: ReactNode;
}

export function ListPageShell({
  title, subtitle, resultCount,
  timeFilter, onTimeFilterChange, typeFilter, onTypeFilterChange, sort, onSortChange,
  onClearFilters, totalPages, page, hasMore, onPageChange, loading, children,
}: ListPageShellProps) {
  const { isHindi } = useSite();
  const filtersActive = timeFilter !== "all" || typeFilter !== "all";

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg px-5 py-5 mb-3.5">
        <h1 className="font-serif text-2xl sm:text-[30px] font-normal">{title}</h1>
        {subtitle && <p className="text-sm text-tx-3 mt-1.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap bg-panel border border-line rounded-lg px-4 py-3 mb-3.5">
        <FilterGroup
          value={timeFilter}
          onChange={onTimeFilterChange}
          options={[
            ["all", isHindi ? "सब" : "All"],
            ["today", isHindi ? "आज" : "Today"],
            ["week", isHindi ? "इस हफ़्ते" : "This week"],
          ]}
        />
        <span className="w-px h-5 bg-line mx-0.5" />
        <FilterGroup
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={[
            ["all", isHindi ? "सब" : "All"],
            ["photo", isHindi ? "तस्वीर सहित" : "With photo"],
            ["text", isHindi ? "सिर्फ़ खबर" : "Text only"],
          ]}
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="text-[13.5px] border border-line rounded-md px-2.5 py-1.5 bg-panel text-tx outline-none"
        >
          <option value="new">{isHindi ? "सबसे नई पहले" : "Newest first"}</option>
          <option value="old">{isHindi ? "सबसे पुरानी पहले" : "Oldest first"}</option>
          <option value="read">{isHindi ? "सबसे ज़्यादा पढ़ी गईं" : "Most read"}</option>
        </select>
        {filtersActive && (
          <button onClick={onClearFilters} className="text-[13.5px] text-brand underline underline-offset-[3px]">
            {isHindi ? "फ़िल्टर हटाएँ" : "Clear filters"}
          </button>
        )}
        {resultCount != null && (
          <span className="text-[13.5px] text-tx-3 ml-auto whitespace-nowrap">
            {resultCount} {isHindi ? "खबरें" : "articles"}
          </span>
        )}
      </div>

      <CategoryTopAd />

      {loading ? (
        <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-line border-t-brand mx-auto" /></div>
      ) : (
        children
      )}

      {(totalPages != null ? totalPages > 1 : hasMore || page > 1) && (
        <Pager page={page} totalPages={totalPages} hasMore={hasMore} onChange={onPageChange} />
      )}
    </div>
  );
}

function FilterGroup<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex border border-line rounded-md overflow-hidden">
      {options.map(([v, label], i) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`text-[13.5px] px-3 py-1.5 whitespace-nowrap transition ${i > 0 ? "border-l border-line" : ""} ${value === v ? "bg-tx text-white" : "text-tx-3 hover:text-tx"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const MAX_VISIBLE_PAGES = 5;

/** Windowed page list around the current page, e.g. [1, "…", 4, 5, 6, "…", 16].
 * Keeps the pager usable on narrow screens instead of listing every page. */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= MAX_VISIBLE_PAGES + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(totalPages - 1, page + half);
  if (page - half <= 2) end = MAX_VISIBLE_PAGES;
  if (page + half >= totalPages - 1) start = totalPages - MAX_VISIBLE_PAGES + 1;

  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const result: (number | "…")[] = [1];
  if (start > 2) result.push("…");
  result.push(...middle);
  if (end < totalPages - 1) result.push("…");
  result.push(totalPages);
  return result;
}

function Pager({ page, totalPages, hasMore, onChange }: { page: number; totalPages?: number; hasMore?: boolean; onChange: (p: number) => void }) {
  const pages = totalPages ? pageWindow(page, totalPages) : null;

  return (
    <div className="flex gap-1.5 justify-center flex-wrap pt-5">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="min-w-[38px] h-[38px] border border-line rounded-md bg-panel text-tx-2 px-2.5 disabled:opacity-40 hover:border-tx hover:text-tx transition"
      >
        <ChevronLeft size={16} className="mx-auto" />
      </button>
      {pages ? (
        pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="min-w-[38px] h-[38px] grid place-items-center text-[14.5px] text-tx-3">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[38px] h-[38px] border rounded-md px-2.5 text-[14.5px] transition ${p === page ? "bg-tx text-white border-tx" : "bg-panel text-tx-2 border-line hover:border-tx hover:text-tx"}`}
            >
              {p}
            </button>
          )
        )
      ) : (
        <span className="min-w-[38px] h-[38px] grid place-items-center text-[14.5px] text-tx-2">{page}</span>
      )}
      <button
        disabled={totalPages ? page >= totalPages : !hasMore}
        onClick={() => onChange(page + 1)}
        className="min-w-[38px] h-[38px] border border-line rounded-md bg-panel text-tx-2 px-2.5 disabled:opacity-40 hover:border-tx hover:text-tx transition"
      >
        <ChevronRight size={16} className="mx-auto" />
      </button>
    </div>
  );
}
