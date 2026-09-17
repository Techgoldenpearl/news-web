"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, HelpCircle, Mail, User, LogOut } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/modals/AuthModal";

const CURRENT_YEAR = new Date().getFullYear();

/** Mobile settings/account hub — the bottom nav's "प्रोफाइल" tab. Distinct
 * from /profile, which is the full profile-editing form; this is a
 * lightweight menu (login entry point, preferences, help, legal links)
 * matching how most news apps separate "account settings" from "edit
 * profile details". */
export default function AccountPage() {
  const { site, isHindi } = useSite();
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  return (
    <div className="max-w-md mx-auto -mt-4 sm:mt-0">
      <div className="flex items-center gap-3 px-1 py-3 border-b border-line mb-1 lg:hidden">
        <Link href="/home" aria-label={t("Back", "वापस")} className="text-tx-2"><ChevronLeft size={22} /></Link>
        <h1 className="font-semibold text-tx">{t("Profile", "प्रोफाइल")}</h1>
      </div>

      <div className="bg-panel border border-line rounded-lg p-4 flex items-center justify-between mb-3.5">
        <span className="font-medium text-tx">{t("My Profile", "मेरा प्रोफाइल")}</span>
        {user ? (
          <Link href="/profile" className="flex items-center gap-1.5 text-sm text-brand font-medium">
            <User size={15} /> {user.name}
          </Link>
        ) : (
          <button onClick={() => setAuthMode("login")} className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
            {t("Login", "लॉगिन")}
          </button>
        )}
      </div>

      <div className="bg-panel border border-line rounded-lg divide-y divide-line mb-3.5 overflow-hidden">
        <Link href="/contact" className="flex items-center justify-between px-4 py-3.5 hover:bg-panel-2 transition">
          <span className="flex items-center gap-2.5 text-tx text-sm font-medium"><HelpCircle size={17} className="text-tx-3" /> FAQs</span>
          <ChevronRight size={16} className="text-tx-3" />
        </Link>
        <Link href="/contact" className="flex items-center justify-between px-4 py-3.5 hover:bg-panel-2 transition">
          <span className="flex items-center gap-2.5 text-tx text-sm font-medium">{t("Send Feedback", "फीडबैक दें")}</span>
          <Mail size={17} className="text-tx-3" />
        </Link>
      </div>

      {user && (
        <button onClick={() => logout()} className="w-full flex items-center gap-2.5 bg-panel border border-line rounded-lg px-4 py-3.5 mb-3.5 text-red-600 text-sm font-medium hover:bg-red-50 transition">
          <LogOut size={17} /> {t("Logout", "लॉग आउट")}
        </button>
      )}

      <div className="bg-panel border border-line rounded-lg overflow-hidden text-sm">
        <div className="px-4 py-3 border-b border-line text-tx-3">
          {t("Legal & Info", "कानूनी व जानकारी")}
        </div>
        {[
          { href: "/about", label: t("About Us", "हमारे बारे में") },
          { href: "/privacy", label: t("Privacy Policy", "गोपनीयता नीति") },
          { href: "/terms", label: t("Terms and Conditions", "नियम और शर्तें") },
          { href: "/contact", label: t("Contact Us", "संपर्क करें") },
        ].map((row) => (
          <Link key={row.href} href={row.href} className="block px-4 py-3 text-tx-2 hover:bg-panel-2 transition border-b border-line last:border-0">
            {row.label}
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-tx-3 mt-4 pb-4">
        © {CURRENT_YEAR} {site?.name || "NewsHub"}. {t("All Rights Reserved.", "सर्वाधिकार सुरक्षित।")}
      </p>

      <AuthModal open={authMode !== null} onClose={() => setAuthMode(null)} initialMode={authMode || "login"} />
    </div>
  );
}
