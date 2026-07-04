"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

function toEditionSlug(edition: string) {
  return edition.trim() ? encodeURIComponent(edition.trim().toLowerCase().replace(/\s+/g, "-")) : "national";
}

interface EpaperCalendarProps {
  edition: string;
  selectedDate: Date;
}

export default function EpaperCalendar({ edition, selectedDate }: EpaperCalendarProps) {
  const router = useRouter();
  const { isHindi } = useSite();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(startOfMonth(selectedDate));
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const monthStr = format(month, "yyyy-MM");
    publicApi.epaperCalendar(monthStr, edition)
      .then((r) => setAvailableDates(new Set((r.data.dates || []).map((d: string) => d.slice(0, 10)))))
      .catch(() => setAvailableDates(new Set()));
  }, [open, month, edition]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const handleSelect = async (day: Date) => {
    const dateIso = format(day, "yyyy-MM-dd");
    if (!availableDates.has(dateIso)) return;
    try {
      const { data } = await publicApi.epaperByDate(dateIso, edition);
      setOpen(false);
      router.push(`/epaper/${toEditionSlug(edition)}/${data.id}/${dateIso}`);
    } catch {
      toast.error(isHindi ? "इस तारीख के लिए कोई अंक नहीं मिला" : "No issue found for this date");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 bg-white text-sm hover:bg-gray-50"
      >
        <CalendarIcon size={14} />
        {format(selectedDate, isHindi ? "dd-MM-yyyy" : "dd MMM yyyy")}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-lg p-3 z-20 w-72">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setMonth((m) => subMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium">{format(month, "MMMM yyyy")}</span>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateIso = format(day, "yyyy-MM-dd");
              const available = availableDates.has(dateIso);
              const isSelected = isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, month);
              return (
                <button
                  key={dateIso}
                  disabled={!available}
                  onClick={() => handleSelect(day)}
                  className={`aspect-square text-xs rounded-full flex items-center justify-center
                    ${!inMonth ? "text-gray-300" : ""}
                    ${available ? "font-medium hover:bg-brand hover:text-white cursor-pointer" : "text-gray-300 cursor-not-allowed"}
                    ${isSelected ? "bg-brand text-white" : available ? "bg-orange-50" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
