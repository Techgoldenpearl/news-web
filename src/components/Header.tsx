"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Search, Flame, BookOpen } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { useUI } from "@/lib/ui-context";
import { PortalSwitcher } from "./header/PortalSwitcher";
import { LanguageSwitcher } from "./header/LanguageSwitcher";
import { FontSizeToggle } from "./header/FontSizeToggle";
import { AccountMenu } from "./header/AccountMenu";

const NAV_ITEMS = [
  { href: "/home", labelHi: "होम", labelEn: "Home", icon: Home },
  { href: "/latest", labelHi: "ताज़ा खबरें", labelEn: "Latest", icon: Newspaper },
  { href: "/shok-sandesh", labelHi: "शोक संदेश", labelEn: "Obituaries", icon: Flame },
  { href: "/epaper", labelHi: "ई-पेपर", labelEn: "E-Paper", icon: BookOpen },
];

export function Header() {
  const { site, isHindi, loading } = useSite();
  const { openSearch } = useUI();
  const pathname = usePathname();
  const siteName = site?.name || (loading ? "" : "NewsHub");

  return (
    <header className="sticky top-0 z-[200] bg-panel border-b border-line shadow-[0_1px_3px_rgba(22,21,15,0.05)]">
      {/* Hidden Google Translate widget — suppressHydrationWarning because Google injects content into it */}
      <div id="google_translate_element" suppressHydrationWarning />

      <div className="max-w-[1560px] mx-auto flex items-center gap-3.5 px-4 sm:px-[22px] h-14 md:h-16">
        <Link href="/home" className="flex items-center gap-2 shrink min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-md">
          {site?.logoUrl ? (
            <span className="relative h-9 sm:h-10 md:h-11 w-[180px] sm:w-[220px] md:w-[260px] block shrink min-w-0">
              <Image src={site.logoUrl} alt={siteName} fill className="object-contain object-left" priority />
            </span>
          ) : (
            <span className="font-serif text-lg md:text-[22px] leading-tight truncate" style={{ color: site?.primaryColor || "var(--accent)" }}>
              {siteName}
            </span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href.split("?")[0];
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[15.5px] font-medium transition ${active ? "text-brand" : "text-tx-2 hover:bg-panel-2 hover:text-tx"}`}
              >
                <Icon size={18} />
                <span>{isHindi ? item.labelHi : item.labelEn}</span>
              </Link>
            );
          })}
          <span className="w-px h-6.5 bg-line mx-1.5" />
          <button
            onClick={openSearch}
            aria-label={isHindi ? "सर्च" : "Search"}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[15.5px] font-medium text-tx-2 hover:bg-panel-2 hover:text-tx transition"
          >
            <Search size={18} />
            <span>{isHindi ? "सर्च" : "Search"}</span>
          </button>
        </nav>

        <button
          onClick={openSearch}
          aria-label={isHindi ? "सर्च" : "Search"}
          className="lg:hidden ml-auto p-2 text-tx-2 hover:bg-panel-2 rounded-lg transition"
        >
          <Search size={19} />
        </button>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <PortalSwitcher />
          <LanguageSwitcher />
          <FontSizeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
