"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";

export default function PhotoGalleryDetailPage() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [gallery, setGallery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      publicApi.photoGallery(slug as string)
        .then((r) => setGallery(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
    </div>
  );

  if (!gallery) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">{isHindi ? "गैलरी नहीं मिली" : "Gallery not found"}</h1>
      <Link href="/photo-gallery" className="text-brand hover:underline">{isHindi ? "सभी गैलरीज़ देखें" : "View all galleries"}</Link>
    </div>
  );

  const images = gallery.images || [];
  const title = isHindi ? (gallery.titleHindi || gallery.title) : gallery.title;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/photo-gallery" className="text-brand hover:underline text-sm">{isHindi ? "← फोटो गैलरी" : "← Photo Gallery"}</Link>
      </div>

      <h1 className="text-3xl font-bold mb-1">{title}</h1>
      <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
        <ImageIcon size={14} /> {images.length} {isHindi ? "फ़ोटो" : "photos"}
      </p>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img: any, i: number) => (
            <button
              key={img.id || i}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition"
            >
              <img
                src={img.imageUrl}
                alt={img.caption || title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end">
                  <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition line-clamp-2">
                    {isHindi ? (img.captionHindi || img.caption) : img.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई फ़ोटो उपलब्ध नहीं" : "No photos available"}</p>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setLightboxIndex(null)}>
            <X size={24} />
          </button>
          <button
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
            disabled={lightboxIndex === 0}
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => Math.max(0, (p ?? 1) - 1)); }}
          >
            <ChevronLeft size={32} />
          </button>
          <div className="max-w-4xl max-h-[90vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex]?.imageUrl}
              alt={images[lightboxIndex]?.caption || title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {images[lightboxIndex]?.caption && (
              <p className="text-white text-center mt-3 text-sm">
                {isHindi ? (images[lightboxIndex].captionHindi || images[lightboxIndex].caption) : images[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/50 text-center text-xs mt-1">{lightboxIndex + 1} / {images.length}</p>
          </div>
          <button
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
            disabled={lightboxIndex === images.length - 1}
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => Math.min(images.length - 1, (p ?? 0) + 1)); }}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
