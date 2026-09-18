"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { Newspaper, Share2 } from "lucide-react";
import { toast } from "sonner";
import EpaperCalendar from "@/components/epaper/EpaperCalendar";

function toEditionSlug(edition: string) {
  return edition.trim() ? encodeURIComponent(edition.trim().toLowerCase().replace(/\s+/g, "-")) : "national";
}

function issueHref(issue: any) {
  const dateIso = new Date(issue.issueDate).toISOString().slice(0, 10);
  return `/epaper/${toEditionSlug(issue.edition || "")}/${issue.id}/${dateIso}`;
}

export default function EpaperPage() {
  const { isHindi, loading: siteLoading } = useSite();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    // The backend's date-scoped epaper route 404s outright without a
    // resolved X-Site-ID (unlike most endpoints, which degrade
    // gracefully) — wait for the site to resolve first, same guard
    // CategoryView uses, so this fetch never races SiteProvider's
    // initial X-Site-ID resolution.
    if (siteLoading) return;
    setLoading(true);
    const dateIso = selectedDate.toISOString().slice(0, 10);
    publicApi.epaperEditionsForDate(dateIso)
      .then((r) => setIssues(r.data.items || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [selectedDate, siteLoading]);

  const handleShare = async (e: React.MouseEvent, issue: any) => {
    e.preventDefault();
    const url = `${window.location.origin}${issueHref(issue)}`;
    if (navigator.share) {
      try { await navigator.share({ url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(isHindi ? "लिंक कॉपी हो गया" : "Link copied");
    }
  };

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg overflow-visible">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line rounded-t-lg">
          <span className="w-[42px] h-[42px] rounded-full bg-[#efede8] grid place-items-center text-[19px] shrink-0"><Newspaper size={19} /></span>
          <h2 className="font-serif text-xl leading-tight">{isHindi ? "आज का ई-पेपर" : "Today's E-Paper"}</h2>
          <div className="ml-auto"><EpaperCalendar edition="" selectedDate={selectedDate} /></div>
        </div>
        <div className="px-5 pt-3.5">
          <span className="text-tx-3 text-[13px]">
            {issues.length > 0 && `· ${isHindi ? `कुल ${issues.length} संस्करण` : `${issues.length} editions`}`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-line border-t-brand" />
          </div>
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
            {issues.map((issue) => (
              <Link key={issue.id} href={issueHref(issue)} className="group block relative">
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-panel-2 border border-line">
                  {issue.coverImageUrl ? (
                    <Image src={issue.coverImageUrl} alt={issue.edition} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-panel-2 to-line">
                      <Newspaper size={32} className="text-tx-3" />
                    </div>
                  )}
                  <span className="absolute left-2 bottom-2 bg-black/78 text-white text-xs px-2.5 py-0.5 rounded-md">
                    {issue.edition || (isHindi ? "राष्ट्रीय" : "National")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-tx-3">
                    {new Date(issue.issueDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <button onClick={(e) => handleShare(e, issue)} className="text-tx-3 hover:text-brand p-1">
                    <Share2 size={14} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-tx-3 py-12">{isHindi ? "इस तारीख के लिए कोई ई-पेपर उपलब्ध नहीं" : "No e-paper issues available for this date"}</p>
        )}
      </div>
    </div>
  );
}
