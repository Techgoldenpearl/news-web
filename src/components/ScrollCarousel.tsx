"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ScrollCarouselProps {
  title: string;
  viewMoreHref?: string;
  viewMoreLabel?: string;
  children: ReactNode;
}

export function ScrollCarousel({ title, viewMoreHref, viewMoreLabel = "View More", children }: ScrollCarouselProps) {
  return (
    <section className="bg-white rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-(--line)">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full bg-brand" />
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
        </div>
        {viewMoreHref && (
          <Link href={viewMoreHref} className="flex items-center gap-0.5 text-xs font-bold text-brand hover:opacity-80 transition uppercase tracking-wide">
            {viewMoreLabel} <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {children}
      </div>
    </section>
  );
}
