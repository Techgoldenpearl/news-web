"use client";

import { Fragment, useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";
import { AdSlot } from "@/components/AdSlot";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => { publicApi.articles({ contentType: "video", limit: 20 }).then((r) => setVideos(r.data.items)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">वीडियो न्यूज़</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((v, i) => (
              <Fragment key={v.id}>
                <NewsCard {...v} />
                {(i + 1) % 6 === 0 && (
                  <div className="md:col-span-2">
                    <AdSlot zone="category-top" className="w-full max-w-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {videos.length === 0 && <p className="text-center text-gray-500 py-12">No videos available</p>}
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>
    </div>
  );
}
