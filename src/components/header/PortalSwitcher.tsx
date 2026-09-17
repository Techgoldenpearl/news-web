"use client";

import { useRef, useState } from "react";
import { useSite } from "@/lib/site-context";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useOutsideClose } from "./useOutsideClose";

export function PortalSwitcher({ compact = false }: { compact?: boolean }) {
  const { site, sites, switchSite, isHindi } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  if (!site) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 bg-panel border border-brand rounded-full px-3 py-1.5 text-sm font-semibold text-tx hover:bg-brand-soft transition"
      >
        <Globe size={16} className="text-brand" />
        {!compact && <span className="max-w-[120px] truncate">{site.name}</span>}
        <ChevronDown size={12} className="text-tx-3" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[min(94vw,390px)] bg-panel border border-line rounded-xl shadow-2xl z-[210] overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-line">
            <h3 className="text-sm font-semibold">
              {isHindi ? "नेटवर्क पोर्टल्स" : "Network Portals"}{" "}
              <span className="text-tx-3 font-normal text-xs">({sites.length} SITES)</span>
            </h3>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-1.5">
            {sites.map((s) => {
              const active = s.id === site.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setOpen(false); switchSite(s.id); }}
                  aria-current={active}
                  className={`w-full flex items-center gap-3 text-right px-3 py-2.5 rounded-lg transition ${active ? "bg-brand-soft shadow-[inset_3px_0_0_var(--accent)]" : "hover:bg-panel-2"}`}
                >
                  <span
                    className="w-11 h-11 rounded-lg shrink-0 grid place-items-center text-[10px] font-bold text-white text-center leading-tight p-1"
                    style={{ background: s.primaryColor || s.theme?.primaryColor || "var(--accent)" }}
                  >
                    {s.name.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1 text-right">
                    <span className={`block font-serif text-base leading-tight truncate ${active ? "text-brand" : "text-tx"}`}>{s.name}</span>
                    {s.tagline && <span className="block text-xs text-tx-3 leading-snug truncate">{s.tagline}</span>}
                  </span>
                  {active && <Check size={16} className="text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
