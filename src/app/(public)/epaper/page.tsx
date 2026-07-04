"use client";

import { useEffect, useState } from "react";
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
  const { isHindi } = useSite();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const dateIso = selectedDate.toISOString().slice(0, 10);
    publicApi.epaperEditionsForDate(dateIso)
      .then((r) => setIssues(r.data.items || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-3xl font-bold">{isHindi ? "ई-पेपर" : "E-Paper"}</h1>
        <EpaperCalendar edition="" selectedDate={selectedDate} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
        </div>
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {issues.map((issue) => (
            <Link key={issue.id} href={issueHref(issue)} className="group block">
              <p className="text-sm font-semibold mb-1.5 truncate">{issue.edition || (isHindi ? "राष्ट्रीय" : "National")}</p>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm bg-gray-100 border">
                {issue.coverImageUrl ? (
                  <img src={issue.coverImageUrl} alt={issue.edition} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Newspaper size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-500">
                  {new Date(issue.issueDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <button onClick={(e) => handleShare(e, issue)} className="text-gray-400 hover:text-brand p-1">
                  <Share2 size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "इस तारीख के लिए कोई ई-पेपर उपलब्ध नहीं" : "No e-paper issues available for this date"}</p>
      )}
    </div>
  );
}
