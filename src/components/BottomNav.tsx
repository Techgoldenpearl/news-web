"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, User } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/home", labelHi: "पढ़ें", labelEn: "Home", icon: Home },
  { href: "/video", labelHi: "देखें", labelEn: "Watch", icon: Play },
  { href: "/account", labelHi: "प्रोफाइल", labelEn: "Profile", icon: User },
];

/** Persistent mobile-only bottom tab bar. Hidden at lg and up, where the header nav covers this. */
export function BottomNav() {
  const { isHindi } = useSite();
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-[190] bg-panel border-t border-line flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition ${active ? "text-brand" : "text-tx-3"}`}
          >
            <span className="relative">
              <Icon size={20} className={active ? "fill-brand/15" : ""} />
              {tab.href === "/account" && user && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-live border border-panel" />
              )}
            </span>
            {isHindi ? tab.labelHi : tab.labelEn}
          </Link>
        );
      })}
    </nav>
  );
}
