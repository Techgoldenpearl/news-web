"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { dedupeCategories } from "@/lib/categories";
import { ArrowUp } from "lucide-react";
import type { Category } from "@/types";

const PORTAL_DOT_COLORS = ["#e8541f", "#d1a017", "#7a4bb5", "#c0392b", "#1d6fa5", "#c0392b", "#4a6741"];

export function Footer() {
  const { site, sites, switchSite, isHindi, loading: siteLoading } = useSite();
  const [categories, setCategories] = useState<Category[]>([]);
  const siteName = site?.name || (siteLoading ? "" : "NewsHub");

  useEffect(() => {
    publicApi.categories().then((r) => {
      const visible = (r.data as Category[]).filter((c) => c.showInNav);
      setCategories(dedupeCategories(visible, site?.id).slice(0, 6));
    }).catch(() => {});
  }, [site?.id]);

  const otherSites = sites.filter((s) => s.id !== site?.id);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-line bg-panel mt-4">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-[22px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr] gap-8 lg:gap-10 pt-8 pb-8">
        <div>
          {site?.logoUrl ? (
            <span className="relative block h-[58px] w-40">
              <Image src={site.logoUrl} alt={siteName} fill sizes="160px" className="object-contain object-left" />
            </span>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-full bg-brand text-white grid place-items-center font-serif text-lg shrink-0">
                {siteName.slice(0, 1)}
              </span>
              <b className="block font-serif text-xl font-normal leading-tight">{siteName}</b>
            </div>
          )}
          <p className="text-sm text-tx-2 leading-[1.75] mt-3.5 max-w-[36ch]">
            {site?.description || (isHindi ? "आपकी विश्वसनीय हिंदी समाचार साइट — राजनीति, खेल, मनोरंजन और बहुत कुछ।" : "Your trusted source for news — politics, sports, entertainment, and more.")}
          </p>
          <div className="flex gap-2.5 mt-4">
            <SocialIcon href={site?.socialLinks?.facebook} label="f" />
            <SocialIcon href={site?.socialLinks?.twitter} label="𝕏" />
            <SocialIcon href={site?.socialLinks?.instagram} label="◎" />
            <SocialIcon href={site?.socialLinks?.youtube} label="▶" />
            <a
              href={site?.socialLinks?.whatsapp || "#"}
              target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#25913f] text-white grid place-items-center hover:brightness-95 transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.9 11.9 0 004.5 4 5 5 0 002.3.5 2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.2-1.2c-.1-.1-.2-.2-.4-.3z"/></svg>
            </a>
          </div>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <span className="border border-line rounded-lg px-3.5 py-2 bg-panel-2">
              <small className="block text-[9.5px] text-tx-3 leading-tight">GET IT ON</small>
              <b className="text-sm font-semibold">Google Play</b>
            </span>
            <span className="border border-line rounded-lg px-3.5 py-2 bg-panel-2">
              <small className="block text-[9.5px] text-tx-3 leading-tight">Download on the</small>
              <b className="text-sm font-semibold">App Store</b>
            </span>
          </div>
        </div>

        <FooterCol title={isHindi ? "खबरें" : "News"}>
          <Link href="/home" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "टॉप न्यूज़" : "Top News"}</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">
              {isHindi ? (c.nameHindi || c.name) : c.name}
            </Link>
          ))}
        </FooterCol>

        <FooterCol title={isHindi ? "सेवाएं" : "Services"}>
          <Link href="/epaper" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "ई-पेपर" : "E-Paper"}</Link>
          <Link href="/shok-sandesh" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "शोक संदेश" : "Obituaries"}</Link>
          <Link href="/classifieds" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "क्लासिफाइड" : "Classifieds"}</Link>
          <Link href="/rashifal" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "राशिफल" : "Horoscope"}</Link>
          {/* मंडी भाव / ब्रेकिंग अलर्ट have no dedicated route yet — link to the closest
              existing equivalents (StockTicker's data lives on the home page; breaking
              alerts are the push-notification opt-in) rather than a dead link. */}
          <Link href="/home" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "मंडी भाव" : "Market Rates"}</Link>
          <Link href="/profile" className="block w-fit text-tx-2 text-[14.5px] py-1 hover:text-brand transition">{isHindi ? "ब्रेकिंग अलर्ट" : "Breaking Alerts"}</Link>
        </FooterCol>

        <div>
          <ColTitle>{isHindi ? "संपर्क" : "Contact"}</ColTitle>
          <div className="flex flex-col gap-2 mt-0.5">
            {/* address/phone/hours have no backing field on Site today — only
                render them when real data exists, rather than showing
                fabricated placeholder text as if it were real. */}
            {site?.address && (
              <div className="flex gap-2.5 text-sm text-tx-2 leading-[1.6]">
                <span className="text-brand shrink-0">📍</span>
                <span>{site.address}</span>
              </div>
            )}
            {(site?.email || site?.domain) && (
              <div className="flex gap-2.5 text-sm text-tx-2 leading-[1.6]">
                <span className="text-brand shrink-0">✉️</span>
                <a href={`mailto:${site.email || `editorial@${site.domain}`}`} className="hover:text-brand transition break-all">
                  {site.email || `editorial@${site.domain}`}
                </a>
              </div>
            )}
            {site?.phone && (
              <div className="flex gap-2.5 text-sm text-tx-2 leading-[1.6]">
                <span className="text-brand shrink-0">📞</span>
                <span className="font-mono">{site.phone}</span>
              </div>
            )}
          </div>
          <Link href="/contact" className="block mt-4 bg-brand-soft text-brand border border-[#f3ddcb] rounded-lg px-4 py-3 text-center font-medium text-[14.5px] hover:bg-brand hover:text-white transition">
            📩 {isHindi ? "हमें खबर भेजें" : "Send us a tip"}
          </Link>
        </div>
      </div>

      {otherSites.length > 0 && (
        <div className="bg-panel-2 border-t border-b border-line">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-[22px] flex items-center gap-4 flex-wrap py-4">
            <span className="text-xs tracking-[1.2px] text-tx-3 font-semibold shrink-0">
              {isHindi ? "नेटवर्क के अन्य पोर्टल" : "OTHER NETWORK PORTALS"}
            </span>
            <div className="flex flex-wrap gap-2.5 flex-1 min-w-0">
              {otherSites.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => switchSite(s.id)}
                  className="flex items-center gap-2 border border-line rounded-full px-3.5 py-1.5 text-[13.5px] bg-panel text-tx-2 hover:border-brand hover:text-tx transition"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PORTAL_DOT_COLORS[i % PORTAL_DOT_COLORS.length] }} />
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1560px] mx-auto px-4 sm:px-[22px] flex items-center gap-4.5 flex-wrap py-5 text-xs text-tx-3">
        <span className="font-mono">© {new Date().getFullYear()} {siteName} {isHindi ? "न्यूज़ मीडिया" : "News Media"} · {isHindi ? "सर्वाधिकार सुरक्षित" : "All rights reserved"}</span>
        <div className="flex gap-4 flex-wrap">
          <Link href="/privacy" className="hover:text-tx transition">{isHindi ? "गोपनीयता नीति" : "Privacy Policy"}</Link>
          <Link href="/terms" className="hover:text-tx transition">{isHindi ? "उपयोग की शर्तें" : "Terms of Use"}</Link>
          <Link href="/editorial-guidelines" className="hover:text-tx transition">{isHindi ? "संपादकीय दिशानिर्देश" : "Editorial Guidelines"}</Link>
          <Link href="/grievance-redressal" className="hover:text-tx transition">{isHindi ? "शिकायत निवारण" : "Grievance Redressal"}</Link>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:ml-auto">
          <Link href="/patrakar/login" className="border border-line rounded-md px-3 py-1.5 text-tx-3 hover:border-brand hover:text-brand transition">{isHindi ? "पत्रकार पोर्टल" : "Journalist Portal"}</Link>
          <Link href="/advertiser/login" className="border border-line rounded-md px-3 py-1.5 text-tx-3 hover:border-brand hover:text-brand transition">{isHindi ? "विज्ञापनदाता" : "Advertiser"}</Link>
          <button
            onClick={scrollTop}
            aria-label={isHindi ? "ऊपर जाएं" : "Scroll to top"}
            className="w-8 h-8 rounded-full border border-line grid place-items-center text-tx-2 hover:border-brand hover:text-brand transition shrink-0"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <b className="block font-serif text-[17px] font-normal mb-3.5 pb-2.5 border-b-2 border-brand w-fit">
      {children}
    </b>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <ColTitle>{title}</ColTitle>
      {children}
    </div>
  );
}

function SocialIcon({ href, label }: { href?: string; label: string }) {
  return (
    <a
      href={href || "#"}
      target="_blank" rel="noopener noreferrer"
      className="w-9 h-9 rounded-full border border-line grid place-items-center text-sm text-tx-2 hover:border-brand hover:text-brand transition"
    >
      {label}
    </a>
  );
}
