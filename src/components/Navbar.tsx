"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Search, Menu, X, User, Bookmark, LogOut, Globe, Clock, Languages } from "lucide-react";

const TRANSLATE_LANGS = [
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو" },
];

function setGoogTransCookie(value: string) {
  // Set without explicit domain first (works for localhost and subdomains)
  document.cookie = `googtrans=${value}; path=/`;
  // Also set with domain for production (may be ignored on localhost, that's fine)
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    document.cookie = `googtrans=${value}; path=/; domain=${host}`;
  }
}

function clearGoogTransCookie() {
  const exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
  document.cookie = `googtrans=; ${exp}; path=/`;
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    document.cookie = `googtrans=; ${exp}; path=/; domain=${host}`;
  }
}

function triggerGoogleTranslate(langCode: string, srcLang: string) {
  if (langCode === srcLang) {
    clearGoogTransCookie();
  } else {
    setGoogTransCookie(`/${srcLang}/${langCode}`);
  }
  window.location.reload();
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { site, sites, switchSite, isHindi } = useSite();
  const [categories, setCategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translatePos, setTranslatePos] = useState({ top: 0, right: 0 });
  const [activeLang, setActiveLang] = useState<string>('hi');
  const translateBtnRef = useRef<HTMLButtonElement>(null);

  // Source language of the current site (hi for Hindi sites, en for English sites)
  const srcLang = site?.language || 'hi';

  useEffect(() => {
    // Read active translated language from googtrans cookie
    const match = document.cookie.match(/googtrans=\/\w+\/(\w+)/);
    if (match && match[1]) {
      setActiveLang(match[1]);
    } else {
      setActiveLang(srcLang);
    }
  }, [srcLang]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    publicApi.categories().then((r) => setCategories(r.data.filter((c: any) => c.showInNav).slice(0, 10))).catch(() => {});
  }, [site]);

  const siteName = site?.name || "NewsHub";
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
            <Link href="/photo-gallery" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "फोटो गैलरी" : "Gallery"}</Link>
            <Link href="/epaper" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "ई-पेपर" : "E-Paper"}</Link>
            <Link href="/shok-sandesh" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "शोक संदेश" : "Obituaries"}</Link>
            <Link href="/classifieds" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "वर्गीकृत विज्ञापन" : "Classifieds"}</Link>
            <Link href="/patrakar/login" className="bg-brand-tint text-brand hover:opacity-80 transition text-xs font-bold px-2 py-0.5 rounded">
              📰 {isHindi ? "पत्रकार पोर्टल" : "Journalist Portal"}
            </Link>
            <Link href="/advertiser/login" className="bg-brand text-white hover:opacity-90 transition text-xs font-bold px-2 py-0.5 rounded">
              📣 {isHindi ? "विज्ञापन दें" : "Advertise"}
            </Link>

            {/* Translate dropdown */}
            <div className="relative">
              <button
                ref={translateBtnRef}
                onClick={() => {
                  if (!translateOpen && translateBtnRef.current) {
                    const rect = translateBtnRef.current.getBoundingClientRect();
                    setTranslatePos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                  }
                  setTranslateOpen(!translateOpen);
                }}
                className="flex items-center gap-1 text-white/70 hover:text-brand transition text-xs font-medium"
                title="Translate page"
              >
                <Languages size={13} />
                {TRANSLATE_LANGS.find(l => l.code === activeLang)?.label || 'Translate'}
              </button>
              {translateOpen && (
                <>
                  <div className="fixed inset-0 z-[65]" onClick={() => setTranslateOpen(false)} />
                  <div
                    className="fixed w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[70] py-1 max-h-72 overflow-y-auto"
                    style={{ top: translatePos.top, right: translatePos.right }}
                  >
                    <p className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-100 mb-1">Translate To</p>
                    {TRANSLATE_LANGS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { triggerGoogleTranslate(lang.code, srcLang); setActiveLang(lang.code); setTranslateOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${activeLang === lang.code ? 'bg-orange-50 text-brand font-semibold' : 'text-gray-700 hover:bg-orange-50 hover:text-brand'}`}
                      >
                        {lang.label}
                        {activeLang === lang.code && <span className="text-brand text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
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
            {user ? (
              <Link href="/profile" className="text-white/70 hover:text-brand transition text-xs font-medium flex items-center gap-1">
                <User size={11} /> {user.name || (isHindi ? "प्रोफ़ाइल" : "Profile")}
              </Link>
            ) : (
              <Link href="/login" className="text-white/70 hover:text-brand transition text-xs font-medium">{isHindi ? "लॉगिन / रजिस्टर" : "Login / Register"}</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className="news-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-[70px]">
            <div className="flex items-center gap-3">
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link href="/home" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-md px-0.5">
                {site?.logoUrl ? (
                  <Image src={site.logoUrl} alt={siteName} width={160} height={40} className="h-8 md:h-10 w-auto object-contain" priority />
                ) : (
                  <span className="text-xl md:text-2xl font-black tracking-tight" style={{ color: siteColor }}>{siteName}</span>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); } }}
                  className="flex items-center gap-1">
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isHindi ? "खोजें..." : "Search..."} className="px-3 py-1.5 border rounded-full text-sm w-44 focus:w-56 transition-all focus:ring-2 focus:ring-orange-300 focus:border-brand" />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="p-1.5 text-gray-400"><X size={16} /></button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-500 hover:text-brand hover:bg-orange-50 rounded-lg transition">
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
                <Link href="/login" className="hidden md:flex items-center gap-1.5 text-white text-sm font-bold px-3 py-1.5 rounded-lg ml-1 transition bg-brand hover:opacity-90">
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
              <Link href="/epaper" className={pathname === "/epaper" ? "active" : ""}>{isHindi ? "ई-पेपर" : "E-Paper"}</Link>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
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
