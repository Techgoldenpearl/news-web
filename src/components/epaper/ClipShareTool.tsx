"use client";

import { useRef, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Scissors, Download, X, Share2 } from "lucide-react";

interface DraftRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClipShareToolProps {
  issueId: number;
  pageId: number;
  imageUrl: string;
}

export default function ClipShareTool({ issueId, pageId, imageUrl }: ClipShareToolProps) {
  const { isHindi } = useSite();
  const [active, setActive] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<DraftRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getRelativePos = (e: React.MouseEvent) => {
    const box = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)),
      y: Math.min(1, Math.max(0, (e.clientY - box.top) / box.height)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setDragStart(pos);
    setDrawing(true);
    setRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !dragStart) return;
    const pos = getRelativePos(e);
    setRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      width: Math.abs(pos.x - dragStart.x),
      height: Math.abs(pos.y - dragStart.y),
    });
  };

  const handleMouseUp = () => setDrawing(false);

  const clipUrl = rect && rect.width > 0.01 && rect.height > 0.01
    ? publicApi.epaperClipUrl(issueId, pageId, rect)
    : null;

  const handleShare = async () => {
    if (!clipUrl) return;
    if (navigator.share) {
      try { await navigator.share({ url: clipUrl, title: isHindi ? "ई-पेपर क्लिप" : "E-Paper Clip" }); }
      catch { /* user cancelled share */ }
    } else {
      window.open(clipUrl, "_blank");
    }
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 bg-white text-sm hover:bg-gray-50"
      >
        <Scissors size={14} /> {isHindi ? "क्लिप करें" : "Clip"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[110] flex flex-col items-center justify-center p-4">
      <button
        onClick={() => { setActive(false); setRect(null); }}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <X size={24} />
      </button>
      <p className="text-white text-sm mb-3">{isHindi ? "क्लिप करने के लिए खींचें" : "Drag to select the area to clip"}</p>
      <div
        ref={containerRef}
        className="relative max-w-4xl max-h-[75vh] cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img src={imageUrl} alt="Page" className="max-h-[75vh] w-auto object-contain pointer-events-none" draggable={false} />
        {rect && (
          <div
            className="absolute border-2 border-dashed border-brand bg-brand/10"
            style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%` }}
          />
        )}
      </div>
      {clipUrl && (
        <div className="flex gap-3 mt-4">
          <a href={clipUrl} download className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm">
            <Download size={16} /> {isHindi ? "डाउनलोड" : "Download"}
          </a>
          <button onClick={handleShare} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm">
            <Share2 size={16} /> {isHindi ? "शेयर करें" : "Share"}
          </button>
        </div>
      )}
    </div>
  );
}
