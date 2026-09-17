"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { User as UserIcon, ChevronDown, LogIn, UserPlus, FileText, Megaphone, User, Clock, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { useOutsideClose } from "./useOutsideClose";
import { AuthModal } from "@/components/modals/AuthModal";

// Reporter/advertiser sessions are only known within their own route groups
// ((reporter)/(advertiser) each wrap their own provider) — firing those
// /me checks for every public-site pageview would cost two extra requests
// for the overwhelming majority of readers who are neither. The public
// header therefore always shows plain login links for these two roles
// rather than "already logged in" state; their own portals already show
// the real logged-in UI once inside.
export function AccountMenu({ compact = false, align = "right" }: { compact?: boolean; align?: "left" | "right" }) {
  const { isHindi } = useSite();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const label = user ? user.name : isHindi ? "लॉगिन" : "Login";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 border border-line rounded-full px-3 py-1.5 text-sm text-tx-2 hover:border-brand hover:text-tx transition"
      >
        <UserIcon size={17} />
        {!compact && <span className="max-w-[110px] truncate">{label}</span>}
        <ChevronDown size={11} className="text-tx-3" />
      </button>
      {open && (
        <div className={`absolute top-[calc(100%+10px)] ${align === "left" ? "left-0" : "right-0"} w-[min(88vw,290px)] bg-panel border border-line rounded-xl shadow-2xl z-[210] p-1.5`}>
          <div className="text-xs text-tx-3 px-3 pt-2 pb-1.5">{isHindi ? "पाठक" : "Reader"}</div>
          {user ? (
            <>
              <MenuItem icon={<User size={16} />} label={isHindi ? "प्रोफ़ाइल" : "Profile"} sub={user.email} href="/profile" onClick={() => setOpen(false)} />
              <MenuItem icon={<Clock size={16} />} label={isHindi ? "इतिहास" : "History"} href="/history" onClick={() => setOpen(false)} />
              <MenuItem icon={<Bookmark size={16} />} label={isHindi ? "बुकमार्क" : "Bookmarks"} href="/bookmarks" onClick={() => setOpen(false)} />
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} className="mt-0.5 shrink-0" />
                <span className="flex-1 text-left font-medium">{isHindi ? "लॉग आउट" : "Logout"}</span>
              </button>
            </>
          ) : (
            <>
              <MenuButton icon={<LogIn size={16} />} label={isHindi ? "लॉगिन" : "Login"} sub={isHindi ? "खबरें सहेजें, अलर्ट पाएँ" : "Save news, get alerts"} onClick={() => { setOpen(false); setAuthMode("login"); }} />
              <MenuButton icon={<UserPlus size={16} />} label={isHindi ? "नया खाता" : "New Account"} sub={isHindi ? "एक मिनट में बन जाएगा" : "Takes a minute"} onClick={() => { setOpen(false); setAuthMode("signup"); }} />
            </>
          )}
          <div className="text-xs text-tx-3 px-3 pt-3 pb-1.5 mt-1 border-t border-line">{isHindi ? "काम के लिए" : "For work"}</div>
          <MenuItem
            icon={<FileText size={16} />}
            label={isHindi ? "पत्रकार पोर्टल" : "Journalist Portal"}
            sub={isHindi ? "संवाददाताओं के लिए" : "For reporters"}
            href="/patrakar/login"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={<Megaphone size={16} />}
            label={isHindi ? "विज्ञापनदाता" : "Advertiser"}
            sub={isHindi ? "विज्ञापन और बिल" : "Ads & billing"}
            href="/advertiser/login"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
      <AuthModal open={authMode !== null} onClose={() => setAuthMode(null)} initialMode={authMode || "login"} />
    </div>
  );
}

function MenuItem({ icon, label, sub, href, onClick }: { icon: React.ReactNode; label: string; sub?: string; href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg hover:bg-panel-2 transition">
      <span className="mt-0.5 shrink-0 text-tx-2">{icon}</span>
      <span className="flex-1 flex flex-col gap-0.5 text-left">
        <span className="text-sm font-medium text-tx">{label}</span>
        {sub && <span className="text-xs text-tx-3 truncate">{sub}</span>}
      </span>
    </Link>
  );
}

function MenuButton({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg hover:bg-panel-2 transition">
      <span className="mt-0.5 shrink-0 text-tx-2">{icon}</span>
      <span className="flex-1 flex flex-col gap-0.5 text-left">
        <span className="text-sm font-medium text-tx">{label}</span>
        {sub && <span className="text-xs text-tx-3 truncate">{sub}</span>}
      </span>
    </button>
  );
}
