"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { Newspaper, LogOut, FileText, Plus, IdCard, User } from "lucide-react";

const NAV = [
  { href: "/patrakar/dashboard", label: "डैशबोर्ड", icon: FileText },
  { href: "/patrakar/submissions/new", label: "नया लेख", icon: Plus },
  { href: "/patrakar/id-card", label: "ID कार्ड", icon: IdCard },
  { href: "/patrakar/profile", label: "प्रोफ़ाइल", icon: User },
];

export function ReporterHeader() {
  const { reporter, logout } = useReporterAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/patrakar/login");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/patrakar/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-tint rounded-xl flex items-center justify-center">
              <Newspaper className="text-brand" size={18} />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">पत्रकार पोर्टल</p>
              <p className="text-xs text-gray-400 mt-0.5">{reporter?.employeeId}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition">
            <LogOut size={16} /> लॉग आउट
          </button>
        </div>
        <nav className="flex items-center gap-1 -mx-1 pb-2 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  active ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <item.icon size={14} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
