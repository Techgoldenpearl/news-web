"use client";

interface Page {
  id: number;
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl?: string | null;
}

interface ThumbnailStripProps {
  pages: Page[];
  pageIndex: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailStrip({ pages, pageIndex, onSelect }: ThumbnailStripProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={pageIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="border rounded-lg px-2 py-1.5 text-sm bg-white flex-shrink-0"
      >
        {pages.map((p, i) => (
          <option key={p.id} value={i}>Page {p.pageNumber}</option>
        ))}
      </select>
      <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(i)}
            className={`flex-shrink-0 w-16 aspect-[3/4] rounded-lg overflow-hidden border-2 ${i === pageIndex ? "border-brand" : "border-transparent"}`}
          >
            <img src={p.thumbnailUrl || p.imageUrl} alt={`Page ${p.pageNumber}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
