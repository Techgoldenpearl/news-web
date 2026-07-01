import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BreakingBanner } from "@/components/BreakingBanner";
import { StockTicker } from "@/components/StockTicker";
import { LeaderboardAd, BreakingBelowAd, ResponsiveAd } from "@/components/AdUnit";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StockTicker />
      <Navbar />
      <BreakingBanner />
      <div className="max-w-7xl mx-auto px-4">
        <LeaderboardAd />
        <BreakingBelowAd />
      </div>
      <main className="flex-1">{children}</main>
      <div className="max-w-7xl mx-auto px-4">
        <ResponsiveAd />
      </div>
      <Footer />
    </>
  );
}
