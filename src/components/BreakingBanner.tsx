"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Zap } from "lucide-react";

export function BreakingBanner() {
  const { isHindi } = useSite();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const load = () => publicApi.articles({ isBreaking: "true", limit: 10 }).then((r) => setArticles(r.data.items)).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (articles.length === 0) return null;

  const tickerText = articles.map((a) => (isHindi ? (a.titleHindi || a.title) : a.title)).join("   ●   ");

  return (
    <div className="breaking-ticker flex items-stretch" style={{ minHeight: "34px" }}>
      <div className="breaking-label">
        <Zap size={12} className="animate-pulse mr-1.5" />
        {isHindi ? "ब्रेकिंग" : "BREAKING"}
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center px-3">
        <span className="ticker-text">{tickerText}</span>
      </div>
    </div>
  );
}
