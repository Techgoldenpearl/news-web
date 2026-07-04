"use client";

import { Fragment, useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ImageIcon } from "lucide-react";

export default function PhotoGalleryPage() {
  const { isHindi } = useSite();
  const [galleries, setGalleries] = useState<any[]>([]);

  useEffect(() => { publicApi.photoGalleries({ limit: 20 }).then((r) => setGalleries(r.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "फोटो गैलरी" : "Photo Galleries"}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {galleries.map((g, i) => (
              <Fragment key={g.id}>
                <Link href={`/photo-gallery/${g.slug}`} className="group">
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-md bg-gray-100">
                    {g.thumbnailUrl ? (
                      <img src={g.thumbnailUrl} alt={isHindi ? (g.titleHindi || g.title) : g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold line-clamp-2">{isHindi ? (g.titleHindi || g.title) : g.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ImageIcon size={12} className="text-white/70" />
                        <span className="text-white/70 text-xs">{g.imageCount || 0} {isHindi ? "फ़ोटो" : "photos"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                {(i + 1) % 6 === 0 && (
                  <div className="md:col-span-2">
                    <AdSlot zone="category-top" className="w-full max-w-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {galleries.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "कोई फोटो गैलरी उपलब्ध नहीं" : "No photo galleries available"}</p>}
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>
    </div>
  );
}
