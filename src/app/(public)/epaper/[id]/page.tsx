"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, ZoomIn, X } from "lucide-react";

export default function EpaperDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isHindi } = useSite();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [adjacent, setAdjacent] = useState<{ prevId: number | null; nextId: number | null }>({ prevId: null, nextId: null });

  useEffect(() => {
    if (id) {
      setPageIndex(0);
      publicApi.epaperIssue(Number(id))
        .then((r) => setIssue(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
      publicApi.epaperAdjacent(Number(id))
        .then((r) => setAdjacent(r.data))
        .catch(() => setAdjacent({ prevId: null, nextId: null }));
    }
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
    </div>
  );

  if (!issue) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">{isHindi ? "अंक नहीं मिला" : "Issue not found"}</h1>
      <Link href="/epaper" className="text-brand hover:underline">{isHindi ? "सभी ई-पेपर देखें" : "View all issues"}</Link>
    </div>
  );

  const pages = issue.pages || [];
  const currentPage = pages[pageIndex];
  const dateLabel = new Date(issue.issueDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/epaper" className="text-brand hover:underline text-sm">{isHindi ? "← ई-पेपर" : "← E-Paper"}</Link>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => adjacent.prevId && router.push(`/epaper/${adjacent.prevId}`)}
              disabled={!adjacent.prevId}
              aria-label={isHindi ? "पिछला अंक" : "Previous issue"}
              className="p-1.5 rounded-full border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold">{dateLabel}</h1>
            <button
              onClick={() => adjacent.nextId && router.push(`/epaper/${adjacent.nextId}`)}
              disabled={!adjacent.nextId}
              aria-label={isHindi ? "अगला अंक" : "Next issue"}
              className="p-1.5 rounded-full border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {issue.pdfUrl && (
          <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" download
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            <Download size={16} /> {isHindi ? "पीडीएफ़ डाउनलोड करें" : "Download PDF"}
          </a>
        )}
      </div>

      {pages.length > 0 ? (
        <>
          <div className="relative bg-gray-100 rounded-xl border overflow-hidden flex items-center justify-center min-h-[60vh]">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="absolute left-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow disabled:opacity-30"
            >
              <ChevronLeft size={24} />
            </button>

            <img
              src={currentPage.imageUrl}
              alt={`Page ${currentPage.pageNumber}`}
              className="max-h-[75vh] object-contain cursor-zoom-in"
              onClick={() => setZoomed(true)}
            />

            <button
              onClick={() => setPageIndex((p) => Math.min(pages.length - 1, p + 1))}
              disabled={pageIndex === pages.length - 1}
              className="absolute right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow disabled:opacity-30"
            >
              <ChevronRight size={24} />
            </button>

            <button
              onClick={() => setZoomed(true)}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-3">
            {isHindi ? "पृष्ठ" : "Page"} {currentPage.pageNumber} / {pages.length}
          </p>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {pages.map((p: any, i: number) => (
              <button
                key={p.id}
                onClick={() => setPageIndex(i)}
                className={`flex-shrink-0 w-16 aspect-[3/4] rounded-lg overflow-hidden border-2 ${i === pageIndex ? "border-brand" : "border-transparent"}`}
              >
                <img src={p.thumbnailUrl || p.imageUrl} alt={`Page ${p.pageNumber}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई पृष्ठ उपलब्ध नहीं" : "No pages available"}</p>
      )}

      {zoomed && currentPage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setZoomed(false)}>
            <X size={24} />
          </button>
          <img
            src={currentPage.imageUrl}
            alt={`Page ${currentPage.pageNumber}`}
            className="max-w-full max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
