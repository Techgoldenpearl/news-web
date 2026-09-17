import { AdSlot, type AdZone } from "./AdSlot";
import { AdCarousel } from "./AdCarousel";

export function LeaderboardAd({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-2 ${className}`}>
      <AdCarousel zone="header-leaderboard" className="w-full max-w-[970px]" />
    </div>
  );
}

export function SidebarAd({ className = "", position = "top" }: { className?: string; position?: "top" | "middle" }) {
  const zone: AdZone = position === "middle" ? "sidebar-middle" : "sidebar-top";
  return <AdCarousel zone={zone} className={`w-full ${className}`} />;
}

// Alias for the persistent right rail (same ad zones as the old inline
// sidebar ads — the rail replaces per-page <aside> ad columns).
export const RailAd = SidebarAd;

export function InArticleAd({ className = "", position = 1 }: { className?: string; position?: 1 | 2 }) {
  const zone: AdZone = position === 2 ? "in-article-2" : "in-article-1";
  return (
    <div className={`flex justify-center my-6 ${className}`}>
      <AdSlot zone={zone} className="w-full max-w-[336px]" />
    </div>
  );
}

export function ResponsiveAd({ className = "" }: { className?: string }) {
  return <AdCarousel zone="footer-banner" className={`w-full ${className}`} />;
}

export function CategoryTopAd({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-2 ${className}`}>
      <AdCarousel zone="category-top" className="w-full max-w-[970px]" />
    </div>
  );
}

export function BreakingBelowAd({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-1 ${className}`}>
      <AdCarousel zone="breaking-below" className="w-full max-w-[970px]" />
    </div>
  );
}
