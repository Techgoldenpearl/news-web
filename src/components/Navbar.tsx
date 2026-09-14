"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Search, Menu, X, User, Bookmark, LogOut, Globe, Clock, ChevronDown, MoreHorizontal } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { site, sites, switchSite, isHindi, loading: siteLoading } = useSite();
  const [categories, setCategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    publicApi.categories().then((r) => setCategories(r.data.filter((c: any) => c.showInNav).slice(0, 10))).catch(() => {});
  }, [site]);

  const siteName = site?.name || (siteLoading ? "" : "NewsHub");
  const siteColor = site?.primaryColor || "var(--accent)";

  const today = new Date().toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      {/* Hidden Google Translate widget — suppressHydrationWarning because Google injects content into it */}
      <div id="google_translate_element" suppressHydrationWarning />

      {/* Top utility bar */}
      <div className="news-topbar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>{today}</span>
          <div className="flex items-center gap-4">
            <Link href="/video" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "वीडियो" : "Video"}</Link>
            <Link href="/rashifal" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "राशिफल" : "Horoscope"}</Link>
            <Link href="/web-stories" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "वेब स्टोरीज़" : "Web Stories"}</Link>
            <Link href="/epaper" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "ई-पेपर" : "E-Paper"}</Link>

            {/* More: secondary links that don't need to compete for topbar space */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button onClick={() => setMoreOpen(!moreOpen)} className="flex items-center gap-1 text-white/70 hover:text-brand transition text-xs font-medium">
                {isHindi ? "अधिक" : "More"} <ChevronDown size={12} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-xl shadow-lg z-50 py-1">
                    <Link href="/photo-gallery" onClick={() => setMoreOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand">{isHindi ? "फोटो गैलरी" : "Photo Gallery"}</Link>
                    <Link href="/shok-sandesh" onClick={() => setMoreOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand">{isHindi ? "शोक संदेश" : "Obituaries"}</Link>
                    <Link href="/classifieds" onClick={() => setMoreOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand">{isHindi ? "वर्गीकृत विज्ञापन" : "Classifieds"}</Link>
                    <div className="border-t my-1" />
                    <Link href="/patrakar/login" onClick={() => setMoreOpen(false)} className="block px-3 py-2 text-sm text-brand font-semibold hover:bg-orange-50">📰 {isHindi ? "पत्रकार पोर्टल" : "Journalist Portal"}</Link>
                    <Link href="/advertiser/login" onClick={() => setMoreOpen(false)} className="block px-3 py-2 text-sm text-brand font-semibold hover:bg-orange-50">📣 {isHindi ? "विज्ञापन दें" : "Advertise"}</Link>
                  </div>
                </>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setSiteMenuOpen(true)}
              onMouseLeave={() => setSiteMenuOpen(false)}
            >
              <button onClick={() => setSiteMenuOpen(!siteMenuOpen)} className="flex items-center gap-1 text-white/70 hover:text-brand transition text-xs font-medium">
                <Globe size={11} /> {siteName}
              </button>
              {siteMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSiteMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-xl shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
                    <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase">Switch Site</p>
                    {sites.map((s) => (
                      <button key={s.id} onClick={() => { switchSite(s.id); setSiteMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${site?.id === s.id ? "bg-orange-50 text-brand" : "text-gray-700"}`}>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.region || ""} · {s.language === "hi" ? "हिंदी" : "English"}</p>
                        </div>
                        {site?.id === s.id && <span className="text-brand text-xs">●</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className="news-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 md:h-[70px]">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <button onClick={() => setMenuOpen(!menuOpen)} aria-label={isHindi ? "मेनू" : "Menu"} className="lg:hidden p-2 -ml-1 hover:bg-gray-100 active:bg-gray-200 rounded-lg shrink-0 transition-colors">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link href="/home" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-md px-0.5 min-w-0 shrink">
                {site?.logoUrl ? (
                  <span className="relative h-12 md:h-[62px] w-24 sm:w-36 md:w-48 block shrink min-w-0">
                    <Image src={site.logoUrl} alt={siteName} fill className="object-contain object-left" priority />
                  </span>
                ) : (
                  <span className="text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: siteColor }}>{siteName}</span>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {searchOpen ? (
                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); } }}
                  className="flex items-center gap-1 min-w-0">
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isHindi ? "खोजें..." : "Search..."} className="px-3 py-1.5 border rounded-full text-sm w-32 sm:w-44 md:focus:w-56 transition-all focus:ring-2 focus:ring-orange-300 focus:border-brand min-w-0" />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} aria-label={isHindi ? "बंद करें" : "Close"} className="p-2 text-gray-400 shrink-0"><X size={16} /></button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} aria-label={isHindi ? "खोजें" : "Search"} className="p-2 text-gray-500 hover:text-brand hover:bg-orange-50 active:bg-orange-100 rounded-lg transition-colors">
                  <Search size={18} />
                </button>
              )}

              {user && (
                <Link href="/bookmarks" className="p-2 text-gray-500 hover:text-brand hover:bg-orange-50 rounded-lg transition hidden sm:flex">
                  <Bookmark size={18} />
                </Link>
              )}

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 hover:bg-orange-50 rounded-lg">
                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-brand">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-xl shadow-lg z-50 py-1">
                        <div className="px-3 py-2 border-b">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50"><User size={14} /> {isHindi ? "प्रोफ़ाइल" : "Profile"}</Link>
                        <Link href="/history" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50"><Clock size={14} /> {isHindi ? "इतिहास" : "History"}</Link>
                        <Link href="/bookmarks" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50"><Bookmark size={14} /> {isHindi ? "बुकमार्क" : "Bookmarks"}</Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"><LogOut size={14} /> {isHindi ? "लॉग आउट" : "Logout"}</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1.5 rounded-lg ml-1 transition bg-brand hover:opacity-90 shrink-0">
                  <User size={14} /> {isHindi ? "लॉगिन" : "Login"}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Category strip */}
        <div className="news-category-bar hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center overflow-x-auto">
              <Link href="/home" className={pathname === "/home" ? "active" : ""}>{isHindi ? "होम" : "Home"}</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/category/${c.slug}`} className={pathname === `/category/${c.slug}` ? "active" : ""}>
                  {isHindi ? (c.nameHindi || c.name) : c.name}
                </Link>
              ))}
              <Link href="/state" className={pathname.startsWith("/state") ? "active" : ""}>{isHindi ? "राज्य" : "States"}</Link>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl overflow-y-auto overscroll-contain">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-black" style={{ color: siteColor }}>{siteName}</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-gray-500"><X size={20} /></button>
            </div>
            <nav className="p-3 space-y-0.5">
              <Link href="/home" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">{isHindi ? "होम" : "Home"}</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">
                  {isHindi ? (c.nameHindi || c.name) : c.name}
                </Link>
              ))}
              <div className="border-t my-2 pt-2 space-y-0.5">
                <Link href="/state" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📍 {isHindi ? "राज्य" : "States"}</Link>
                <Link href="/rashifal" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">🔮 {isHindi ? "राशिफल" : "Horoscope"}</Link>
                <Link href="/web-stories" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📱 {isHindi ? "वेब स्टोरीज़" : "Web Stories"}</Link>
                <Link href="/photo-gallery" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📷 {isHindi ? "फोटो गैलरी" : "Photo Gallery"}</Link>
                <Link href="/epaper" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📰 {isHindi ? "ई-पेपर" : "E-Paper"}</Link>
                <Link href="/video" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">🎥 {isHindi ? "वीडियो" : "Video"}</Link>
                <Link href="/shok-sandesh" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">🕯️ {isHindi ? "शोक संदेश" : "Obituaries"}</Link>
                <Link href="/classifieds" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📋 {isHindi ? "वर्गीकृत विज्ञापन" : "Classifieds"}</Link>
                <Link href="/patrakar/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📰 {isHindi ? "पत्रकार पोर्टल" : "Journalist Portal"}</Link>
                <Link href="/advertiser/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand rounded-lg">📣 {isHindi ? "विज्ञापन दें" : "Advertise"}</Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
