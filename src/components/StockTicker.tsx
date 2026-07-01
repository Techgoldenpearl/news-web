"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { TrendingUp, TrendingDown } from "lucide-react";

const LABELS: Record<string, string> = {
  petrol: "Petrol", diesel: "Diesel", gold: "Gold", silver: "Silver",
  sensex: "Sensex", nifty: "Nifty", currency: "USD/INR", weather: "Weather",
};

export function StockTicker() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    publicApi.utilityData().then((r) => setItems(r.data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="bg-gray-900 text-white overflow-hidden py-1.5">
      <div className="flex items-center gap-0 whitespace-nowrap animate-marquee">
        {doubled.map((s, i) => {
          const up = !String(s.change || "").startsWith("-");
          return (
            <span key={i} className="inline-flex items-center gap-2 px-4 text-xs border-r border-gray-700 last:border-0">
              <span className="text-gray-400">{LABELS[s.dataType] || s.dataType}{s.city && s.city !== "National" ? ` (${s.city})` : ""}</span>
              <span className="font-semibold">{s.unit?.startsWith("₹") ? "₹" : ""}{s.value}{s.unit && !s.unit.startsWith("₹") ? ` ${s.unit}` : ""}</span>
              {s.change && (
                <span className={`flex items-center gap-0.5 ${up ? "text-green-400" : "text-red-400"}`}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
