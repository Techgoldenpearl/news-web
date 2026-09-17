"use client";

import { usePathname } from "next/navigation";
import { UIProvider } from "@/lib/ui-context";
import { Header } from "@/components/Header";
import { MobileCategoryStrip } from "@/components/MobileCategoryStrip";
import { Sidebar } from "@/components/Sidebar";
import { RightRail } from "@/components/RightRail";
import { SearchOverlay } from "@/components/SearchOverlay";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { BreakingBanner } from "@/components/BreakingBanner";
import { StockTicker } from "@/components/StockTicker";
import { LeaderboardAd, ResponsiveAd } from "@/components/AdUnit";

const AD_FREE_PATHS = ["/about", "/contact", "/privacy", "/terms"];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAds = !AD_FREE_PATHS.includes(pathname);

  return (
    <UIProvider>
      <StockTicker />
      <Header />
      <BreakingBanner />
      <MobileCategoryStrip />
      <div className="shell-grid max-w-[1560px] mx-auto px-4 sm:px-[22px] pt-4 pb-10">
        <Sidebar />
        <main className="min-w-0">
          {showAds && <LeaderboardAd className="mb-3.5" />}
          {children}
        </main>
        <RightRail />
      </div>
      {showAds && (
        <div className="max-w-[1560px] mx-auto px-4 sm:px-[22px]">
          <ResponsiveAd />
        </div>
      )}
      <Footer />
      <SearchOverlay />
      <BottomNav />
      {/* Spacer so the fixed bottom nav never overlaps the footer's last row on mobile. */}
      <div className="lg:hidden h-14" />
    </UIProvider>
  );
}
