"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";

export default function WebStoriesPage() {
  const { isHindi } = useSite();
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => { publicApi.webStories({ limit: 20 }).then((r) => setStories(r.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "वेब स्टोरीज़" : "Web Stories"}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stories.map((s) => (
          <Link key={s.id} href={`/web-stories/${s.slug}`} className="group">
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-md bg-gray-100">
              {s.thumbnailUrl ? (
                <img src={s.thumbnailUrl} alt={isHindi ? (s.titleHindi || s.title) : s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{isHindi ? (s.titleHindi || s.title) : s.title}</p>
                <p className="text-white/60 text-xs mt-1">{s.categoryName}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {stories.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "कोई वेब स्टोरी उपलब्ध नहीं" : "No web stories available"}</p>}
    </div>
  );
}
