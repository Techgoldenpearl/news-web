"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import EpaperCalendar from "@/components/epaper/EpaperCalendar";
import EditionSwitcher from "@/components/epaper/EditionSwitcher";
import EpaperReaderView from "@/components/epaper/EpaperReaderView";
import ThumbnailStrip from "@/components/epaper/ThumbnailStrip";
import ClipShareTool from "@/components/epaper/ClipShareTool";

function toEditionSlug(edition: string) {
  return edition.trim() ? encodeURIComponent(edition.trim().toLowerCase().replace(/\s+/g, "-")) : "national";
}

export default function EpaperDetailPage() {
  const { id, date } = useParams<{ edition: string; id: string; date: string }>();
  const router = useRouter();
  const { isHindi } = useSite();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
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
  const dateIso = new Date(issue.issueDate).toISOString().slice(0, 10);

  const goToAdjacentIssue = (adjacentId: number | null) => {
    if (!adjacentId) return;
    router.push(`/epaper/${toEditionSlug(issue.edition)}/${adjacentId}/${dateIso}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <Link href="/epaper" className="text-brand hover:underline text-sm">{isHindi ? "← ई-पेपर" : "← E-Paper"}</Link>
          <h1 className="text-2xl font-bold mt-1">{dateLabel}{issue.edition ? ` — ${issue.edition}` : ""}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <EpaperCalendar edition={issue.edition} selectedDate={new Date(issue.issueDate)} />
          <EditionSwitcher editions={issue.availableEditions || []} currentEdition={issue.edition} dateIso={dateIso} />
          {currentPage && <ClipShareTool issueId={issue.id} pageId={currentPage.id} imageUrl={currentPage.imageUrl} />}
          {issue.pdfUrl && (
            <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" download
              className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
              <Download size={16} /> {isHindi ? "पीडीएफ़" : "PDF"}
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => goToAdjacentIssue(adjacent.prevId)}
          disabled={!adjacent.prevId}
          aria-label={isHindi ? "पिछला अंक" : "Previous issue"}
          className="p-1.5 rounded-full border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-500">{isHindi ? "अंक बदलें" : "Switch issue"}</span>
        <button
          onClick={() => goToAdjacentIssue(adjacent.nextId)}
          disabled={!adjacent.nextId}
          aria-label={isHindi ? "अगला अंक" : "Next issue"}
          className="p-1.5 rounded-full border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {pages.length > 0 ? (
        <>
          <div className="relative bg-gray-100 rounded-xl border overflow-hidden min-h-[60vh]">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow disabled:opacity-30"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="h-[70vh]">
              <EpaperReaderView
                imageUrl={currentPage.imageUrl}
                pageNumber={currentPage.pageNumber}
                regions={currentPage.regions}
                onNextPage={() => setPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                onPrevPage={() => setPageIndex((p) => Math.max(0, p - 1))}
                hasNext={pageIndex < pages.length - 1}
                hasPrev={pageIndex > 0}
                resetKey={currentPage.id}
              />
            </div>

            <button
              onClick={() => setPageIndex((p) => Math.min(pages.length - 1, p + 1))}
              disabled={pageIndex === pages.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow disabled:opacity-30"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-3">
            {isHindi ? "पृष्ठ" : "Page"} {currentPage.pageNumber} / {pages.length}
          </p>

          <div className="mt-4">
            <ThumbnailStrip pages={pages} pageIndex={pageIndex} onSelect={setPageIndex} />
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई पृष्ठ उपलब्ध नहीं" : "No pages available"}</p>
      )}
    </div>
  );
}
