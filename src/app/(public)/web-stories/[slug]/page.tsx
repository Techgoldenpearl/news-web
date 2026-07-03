"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function WebStoryDetailPage() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slug) {
      publicApi.webStory(slug as string)
        .then((r) => setStory(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
    </div>
  );

  if (!story) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">{isHindi ? "वेब स्टोरी नहीं मिली" : "Story not found"}</h1>
      <Link href="/web-stories" className="text-brand hover:underline">{isHindi ? "सभी स्टोरीज़ देखें" : "View all stories"}</Link>
    </div>
  );

  const slides = story.slides || [];
  const slide = slides[currentSlide];
  const title = isHindi ? (story.titleHindi || story.title) : story.title;

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/web-stories" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <X size={20} />
        </Link>
        <h1 className="text-lg font-bold flex-1 line-clamp-1">{title}</h1>
      </div>

      {slides.length > 0 ? (
        <div className="relative">
          {/* Progress bar */}
          <div className="flex gap-1 mb-2">
            {slides.map((_: any, i: number) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= currentSlide ? "bg-brand" : "bg-gray-200"}`} />
            ))}
          </div>

          {/* Slide */}
          <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900">
            {slide?.imageUrl && (
              <img src={slide.imageUrl} alt={slide.caption || title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {slide?.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-semibold text-lg leading-snug">
                  {isHindi ? (slide.captionHindi || slide.caption) : slide.caption}
                </p>
              </div>
            )}

            {/* Tap zones */}
            <button
              className="absolute inset-y-0 left-0 w-1/3"
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              aria-label="Previous slide"
            />
            <button
              className="absolute inset-y-0 right-0 w-1/3"
              onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
              aria-label="Next slide"
            />
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-30 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} /> {isHindi ? "पिछला" : "Prev"}
            </button>
            <span className="text-sm text-gray-500">{currentSlide + 1} / {slides.length}</span>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-30 hover:bg-gray-50 transition"
            >
              {isHindi ? "अगला" : "Next"} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई स्लाइड उपलब्ध नहीं" : "No slides available"}</p>
      )}
    </div>
  );
}
