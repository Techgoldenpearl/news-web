"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame, MapPin, Landmark, Globe2, Trophy, Film, GraduationCap, Wallet, Shirt,
  Sparkles, Sun, Car, MessageSquare, Newspaper, ChevronDown,
} from "lucide-react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { useUI } from "@/lib/ui-context";
import { dedupeCategories } from "@/lib/categories";
import type { Category, State } from "@/types";
import { PortalSwitcher } from "./header/PortalSwitcher";
import { LanguageSwitcher } from "./header/LanguageSwitcher";
import { FontSizeToggle } from "./header/FontSizeToggle";
import { AccountMenu } from "./header/AccountMenu";

// The category API doesn't return an icon, so slugs are mapped to a
// reasonable icon client-side. Anything unmatched falls back to Newspaper.
const ICON_BY_SLUG: Record<string, any> = {
  "top-news": Flame, politics: Landmark, sports: Trophy, entertainment: Film,
  business: Wallet, education: GraduationCap, lifestyle: Shirt, astrology: Sun,
  tech: Car, auto: Car, opinion: MessageSquare, world: Globe2, national: Landmark,
};

const VISIBLE_COUNT = 9;
const VISIBLE_STATES = 8;

export function Sidebar() {
  const { isHindi, site } = useSite();
  const { sidebarOpen, closeSidebar } = useUI();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [statesExpanded, setStatesExpanded] = useState(false);

  useEffect(() => {
    publicApi.categories().then((r) => {
      const visible = (r.data as Category[]).filter((c) => c.showInNav);
      setCategories(dedupeCategories(visible, site?.id));
    }).catch(() => {});
    publicApi.states().then((r) => setStates(r.data || [])).catch(() => {});
  }, [site?.id]);

  const visible = expanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const extraCount = categories.length - VISIBLE_COUNT;
  const visibleStates = statesExpanded ? states : states.slice(0, VISIBLE_STATES);
  const extraStatesCount = states.length - VISIBLE_STATES;

  return (
    <>
      {sidebarOpen && <div className="shell-scrim lg:hidden" onClick={closeSidebar} />}
      <aside className={`shell-sidebar lg:pb-5 ${sidebarOpen ? "open" : ""}`}>
        {/* Mobile-only controls: Header hides these below lg, so surface them here */}
        <div className="flex lg:hidden flex-col gap-2 pb-3.5 mb-2.5 border-b border-line">
          <div className="flex items-center gap-2">
            <PortalSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <FontSizeToggle />
          </div>
          <div className="flex items-center gap-2">
            <AccountMenu align="left" />
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <Link
            href="/home"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15.5px] font-medium transition ${pathname === "/home" ? "bg-brand-soft text-brand font-semibold" : "text-tx-2 hover:bg-panel-2 hover:text-tx"}`}
          >
            <span className="w-[30px] h-[30px] rounded-lg grid place-items-center shrink-0 bg-brand text-white">
              <Flame size={16} />
            </span>
            {isHindi ? "टॉप न्यूज़" : "Top News"}
          </Link>

          {visible.map((c) => {
            const Icon = ICON_BY_SLUG[c.slug] || Newspaper;
            const href = `/category/${c.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={c.id}
                href={href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15.5px] font-medium transition relative ${active ? "bg-brand-soft text-brand font-semibold" : "text-tx-2 hover:bg-panel-2 hover:text-tx"}`}
              >
                <span
                  className="w-[30px] h-[30px] rounded-lg grid place-items-center shrink-0"
                  style={active ? { background: "var(--accent)", color: "#fff" } : { background: c.color ? `${c.color}1a` : "#f0ede8", color: c.color || "#8d897f" }}
                >
                  <Icon size={16} />
                </span>
                {isHindi ? (c.nameHindi || c.name) : c.name}
                {typeof c.articleCount === "number" && c.articleCount > 0 && (
                  <span className={`mr-auto ml-auto font-mono text-[11.5px] rounded-full px-2 py-0.5 ${active ? "bg-white text-brand" : "bg-panel-2 text-tx-3"}`}>
                    {c.articleCount}
                  </span>
                )}
              </Link>
            );
          })}

          {extraCount > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-right text-brand text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-brand-soft transition"
            >
              {expanded ? (isHindi ? "कम दिखाएँ ▴" : "Show less ▴") : isHindi ? `और ${extraCount} श्रेणियाँ ▾` : `${extraCount} more ▾`}
            </button>
          )}

          {states.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-[10.5px] tracking-[1.4px] text-tx-3 font-semibold pt-5 pb-2 px-3">
                {isHindi ? "राज्य" : "STATES"}
                <span className="flex-1 h-px bg-line" />
              </div>
              {visibleStates.map((s) => {
                const href = `/state/${s.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={s.id}
                    href={href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14.5px] transition ${active ? "bg-brand-soft text-brand font-semibold" : "text-tx-2 hover:bg-panel-2 hover:text-tx"}`}
                  >
                    <span
                      className="w-[30px] h-[30px] rounded-lg grid place-items-center shrink-0"
                      style={active ? { background: "var(--accent)", color: "#fff" } : { background: "#fbeadd", color: "#b5551f" }}
                    >
                      <MapPin size={15} />
                    </span>
                    {isHindi ? (s.nameHindi || s.name) : s.name}
                  </Link>
                );
              })}
              {extraStatesCount > 0 && (
                <button
                  onClick={() => setStatesExpanded((v) => !v)}
                  className="text-right text-brand text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-brand-soft transition"
                >
                  {statesExpanded ? (isHindi ? "कम दिखाएँ ▴" : "Show less ▴") : isHindi ? `और ${extraStatesCount} राज्य ▾` : `${extraStatesCount} more ▾`}
                </button>
              )}
            </>
          )}
        </nav>

        <div className="text-center mt-6.5 pt-5.5 border-t border-line">
          <div className="text-xs text-tx-3 mb-2.5">{isHindi ? "ऐप डाउनलोड करें" : "Download the app"}</div>
          <a className="block border border-line rounded-lg px-3.5 py-2 mx-auto mb-2 max-w-[186px] text-right bg-panel-2">
            <small className="block text-[9.5px] text-tx-3 leading-tight">GET IT ON</small>
            <b className="text-sm font-semibold">Google Play</b>
          </a>
          <a className="block border border-line rounded-lg px-3.5 py-2 mx-auto mb-2 max-w-[186px] text-right bg-panel-2">
            <small className="block text-[9.5px] text-tx-3 leading-tight">Download on the</small>
            <b className="text-sm font-semibold">App Store</b>
          </a>
          {site?.socialLinks && (
            <>
              <div className="text-xs text-tx-3 mt-4 mb-2.5">{isHindi ? "हमें फ़ॉलो करें" : "Follow us"}</div>
              <div className="flex gap-2.5 justify-center">
                {site.socialLinks.facebook && <SocialIcon href={site.socialLinks.facebook} label="f" />}
                {site.socialLinks.twitter && <SocialIcon href={site.socialLinks.twitter} label="𝕏" />}
                {site.socialLinks.instagram && <SocialIcon href={site.socialLinks.instagram} label="◎" />}
                {site.socialLinks.youtube && <SocialIcon href={site.socialLinks.youtube} label="▶" />}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SocialIcon({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-panel-2 grid place-items-center text-sm text-tx-2 hover:bg-line hover:text-tx transition">
      {label}
    </a>
  );
}
