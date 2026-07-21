"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BreakingBanner } from "@/components/BreakingBanner";
import { StockTicker } from "@/components/StockTicker";
import { LeaderboardAd, BreakingBelowAd, ResponsiveAd } from "@/components/AdUnit";

const AD_FREE_PATHS = ["/about", "/contact", "/privacy", "/terms"];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAds = !AD_FREE_PATHS.includes(pathname);

  return (
    <>
      <StockTicker />
      <Navbar />
      <BreakingBanner />
      {showAds && (
        <div className="max-w-7xl mx-auto px-4">
          <LeaderboardAd />
          <BreakingBelowAd />
        </div>
      )}
      <main className="flex-1">{children}</main>
      {showAds && (
        <div className="max-w-7xl mx-auto px-4">
          <ResponsiveAd />
        </div>
      )}
      <Footer />
    </>
  );
}
