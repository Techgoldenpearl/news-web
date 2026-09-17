"use client";

import { useEffect, useMemo, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { ShokSandeshCard } from "@/components/ShokSandeshCard";
import { PlanPickerModal } from "@/components/modals/PlanPickerModal";
import type { State } from "@/types";

const TYPES = [
  { value: "", label: "All", labelHi: "सभी" },
  { value: "shok_sandesh", label: "Shok Sandesh", labelHi: "शोक संदेश" },
  { value: "shradhanjali", label: "Shradhanjali", labelHi: "श्रद्धांजलि" },
  { value: "punyatithi", label: "Punyatithi", labelHi: "पुण्यतिथि" },
  { value: "uthavna", label: "Uthavna", labelHi: "उठावना" },
  { value: "terahvi", label: "Terahvi", labelHi: "तेरहवीं" },
  { value: "smriti_sandesh", label: "Smriti Sandesh", labelHi: "स्मृति संदेश" },
];

export default function ShokSandeshPage() {
  const { isHindi } = useSite();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [city, setCity] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [nameSort, setNameSort] = useState("new");
  const [payTarget, setPayTarget] = useState<any>(null);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data || [])).catch(() => {});
  }, []);

  const loadItems = () => {
    // city/staff/payment-status params are not confirmed server-side
    // (only page/limit/type/search were verified in use) — passed
    // speculatively via the untyped params bag; unrecognized params are
    // presumably ignored by the backend rather than erroring.
    publicApi.shokSandesh({
      page, limit: 12, type: type || undefined, search: search || undefined,
      city: city !== "all" ? city : undefined,
    })
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => {});
  };

  useEffect(() => { loadItems(); }, [page, type, city]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (timeFilter !== "all") {
      const now = Date.now();
      const maxAgeMs = { today: 1, week: 7, month: 30 }[timeFilter]! * 24 * 60 * 60 * 1000;
      list = list.filter((i) => i.createdAt && now - new Date(i.createdAt).getTime() <= maxAgeMs);
    }
    if (ageFilter !== "all") {
      list = list.filter((i) => {
        if (i.deceasedAge == null) return false;
        if (ageFilter === "60") return i.deceasedAge < 60;
        if (ageFilter === "75") return i.deceasedAge >= 60 && i.deceasedAge <= 75;
        return i.deceasedAge > 75;
      });
    }
    if (nameSort === "name") {
      list.sort((a, b) => (a.deceasedNameHindi || a.deceasedName || "").localeCompare(b.deceasedNameHindi || b.deceasedName || ""));
    } else if (nameSort === "old") {
      list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return list;
  }, [items, timeFilter, ageFilter, nameSort]);

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (type) activeFilters.push({ key: "type", label: isHindi ? TYPES.find((t) => t.value === type)?.labelHi! : TYPES.find((t) => t.value === type)?.label!, clear: () => setType("") });
  if (city !== "all") activeFilters.push({ key: "city", label: city, clear: () => setCity("all") });
  if (timeFilter !== "all") activeFilters.push({ key: "time", label: timeFilter, clear: () => setTimeFilter("all") });
  if (ageFilter !== "all") activeFilters.push({ key: "age", label: ageFilter, clear: () => setAgeFilter("all") });

  const clearAll = () => { setType(""); setCity("all"); setTimeFilter("all"); setAgeFilter("all"); setSearch(""); setPage(1); };

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg overflow-hidden mb-3.5">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <span className="w-[42px] h-[42px] rounded-full bg-[#efede8] grid place-items-center text-[19px] shrink-0">🕯️</span>
          <h2 className="font-serif text-xl leading-tight">{isHindi ? "शोक संदेश" : "Obituaries"}</h2>
          <Link href="/shok-sandesh/post" className="ml-auto flex items-center gap-1.5 border border-brand text-brand rounded-md px-3.5 py-1.5 text-sm font-medium hover:bg-brand hover:text-white transition whitespace-nowrap">
            <Plus size={15} /> {isHindi ? "सूचना प्रकाशित कराएँ" : "Submit an Obituary"}
          </Link>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap px-5 py-3">
          <FilterPill label={isHindi ? "समय" : "Time"} />
          <div className="flex border border-line rounded-md overflow-hidden">
            {[["all", isHindi ? "सभी" : "All"], ["today", isHindi ? "आज" : "Today"], ["week", isHindi ? "इस हफ़्ते" : "This week"], ["month", isHindi ? "इस महीने" : "This month"]].map(([v, l], i) => (
              <button key={v} onClick={() => setTimeFilter(v)} aria-pressed={timeFilter === v}
                className={`text-[13.5px] px-3 py-1.5 whitespace-nowrap transition ${i > 0 ? "border-l border-line" : ""} ${timeFilter === v ? "bg-tx text-white" : "text-tx-3 hover:text-tx"}`}>
                {l}
              </button>
            ))}
          </div>
          <span className="w-px h-5 bg-line mx-0.5" />
          <FilterPill label={isHindi ? "शहर" : "City"} />
          <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} className="text-[13.5px] border border-line rounded-md px-2.5 py-1.5 bg-panel text-tx outline-none min-w-[130px]">
            <option value="all">{isHindi ? "सभी" : "All"}</option>
            {states.map((s) => <option key={s.id} value={s.name}>{isHindi ? (s.nameHindi || s.name) : s.name}</option>)}
          </select>
          <FilterPill label={isHindi ? "आयु" : "Age"} />
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="text-[13.5px] border border-line rounded-md px-2.5 py-1.5 bg-panel text-tx outline-none">
            <option value="all">{isHindi ? "सभी" : "All"}</option>
            <option value="60">{isHindi ? "60 से कम" : "Under 60"}</option>
            <option value="75">60 – 75</option>
            <option value="76">{isHindi ? "75 से ऊपर" : "Over 75"}</option>
          </select>
          <select value={nameSort} onChange={(e) => setNameSort(e.target.value)} className="text-[13.5px] border border-line rounded-md px-2.5 py-1.5 bg-panel text-tx outline-none">
            <option value="new">{isHindi ? "नई पहले" : "Newest first"}</option>
            <option value="old">{isHindi ? "पुरानी पहले" : "Oldest first"}</option>
            <option value="name">{isHindi ? "नाम से (अ–ज्ञ)" : "By name"}</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadItems())}
            placeholder={isHindi ? "नाम से खोजें" : "Search by name"}
            className="text-sm border border-line rounded-md px-3 py-1.5 bg-panel text-tx outline-none min-w-[160px] flex-1"
          />
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="text-[13.5px] text-brand underline underline-offset-[3px]">{isHindi ? "फ़िल्टर हटाएँ" : "Clear filters"}</button>
          )}
          <span className="text-[13.5px] text-tx-3 whitespace-nowrap ml-auto">{filtered.length} {isHindi ? "प्रविष्टियाँ" : "entries"}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap bg-brand-soft border-t border-[#f3ddcb] px-4 py-3.5 text-[#7a4a2c] text-sm">
          <span>🕯️</span>
          <span><b className="font-semibold">{isHindi ? "अख़बार में भी छपवाना है?" : "Want it printed in the newspaper too?"}</b> {isHindi ? "वेबसाइट पर प्रकाशन निःशुल्क है" : "Publishing on the website is free"}</span>
          <button onClick={() => setPayTarget({})} className="ml-auto bg-brand text-white rounded-md px-4.5 py-2 text-sm font-medium hover:brightness-95 transition whitespace-nowrap">
            {isHindi ? "पैकेज देखें" : "View Packages"}
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-3">
            {activeFilters.map((f) => (
              <span key={f.key} className="flex items-center gap-1.5 text-[13.5px] bg-brand-soft text-[#8a3512] rounded-full px-2.5 py-1.5">
                {f.label}
                <button onClick={f.clear} aria-label="remove"><X size={13} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {filtered.map((item) => (
            <ShokSandeshCard key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-tx-3 py-12">{isHindi ? "कोई प्रविष्टि नहीं मिली" : "No entries found"}</p>
          )}
        </div>
      </div>

      {Math.ceil(total / 12) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border border-line rounded-md disabled:opacity-40 hover:border-tx transition">{isHindi ? "पिछला" : "Previous"}</button>
          <span className="text-sm text-tx-3">{page} / {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 12)} className="px-4 py-2 border border-line rounded-md disabled:opacity-40 hover:border-tx transition">{isHindi ? "अगला" : "Next"}</button>
        </div>
      )}

      <PlanPickerModal open={!!payTarget} onClose={() => setPayTarget(null)} context="shok" />
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return <span className="text-[13px] text-tx-3 shrink-0">{label}</span>;
}
