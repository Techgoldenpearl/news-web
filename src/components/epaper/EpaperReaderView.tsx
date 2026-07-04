"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import PageHotspotOverlay from "./PageHotspotOverlay";

interface Region {
  id: number;
  articleId: number | null;
  articleSlug: string | null;
  externalUrl: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string | null;
}

interface EpaperReaderViewProps {
  imageUrl: string;
  pageNumber: number;
  regions?: Region[];
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  resetKey: string | number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function EpaperReaderView({ imageUrl, pageNumber, regions, onNextPage, onPrevPage, hasNext, hasPrev, resetKey }: EpaperReaderViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [zoomed, setZoomed] = useState(false);
  const pinchState = useRef<{ startDist: number; startScale: number } | null>(null);

  const resetView = () => {
    animate(scale, 1, { duration: 0.2 });
    animate(x, 0, { duration: 0.2 });
    animate(y, 0, { duration: 0.2 });
    setZoomed(false);
  };

  const applyZoom = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.get() + delta));
    animate(scale, next, { duration: 0.15 });
    setZoomed(next > MIN_SCALE);
    if (next === MIN_SCALE) {
      animate(x, 0, { duration: 0.15 });
      animate(y, 0, { duration: 0.15 });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? 0.25 : -0.25);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); if (!zoomed && hasPrev) onPrevPage(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); if (!zoomed && hasNext) onNextPage(); }
    else if (e.key === "ArrowUp" || e.key === "+" || e.key === "=") { e.preventDefault(); applyZoom(0.25); }
    else if (e.key === "ArrowDown" || e.key === "-") { e.preventDefault(); applyZoom(-0.25); }
  };

  const touchDistance = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchState.current = { startDist: touchDistance(e.touches), startScale: scale.get() };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      const ratio = dist / pinchState.current.startDist;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchState.current.startScale * ratio));
      scale.set(next);
      setZoomed(next > MIN_SCALE);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchState.current = null;
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (zoomed) return;
    const swipeThreshold = 80;
    if (info.offset.x < -swipeThreshold && hasNext) onNextPage();
    else if (info.offset.x > swipeThreshold && hasPrev) onPrevPage();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={() => (zoomed ? resetView() : applyZoom(1.5))}
      className="relative w-full h-full overflow-hidden outline-none touch-none select-none"
    >
      <motion.div
        key={resetKey}
        style={{ scale, x, y }}
        drag={zoomed ? true : "x"}
        dragElastic={zoomed ? 0.2 : 0.15}
        dragConstraints={zoomed ? undefined : { left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <img src={imageUrl} alt={`Page ${pageNumber}`} className="max-h-full max-w-full object-contain pointer-events-none" draggable={false} />
        {regions && <PageHotspotOverlay regions={regions} />}
      </motion.div>
    </div>
  );
}
