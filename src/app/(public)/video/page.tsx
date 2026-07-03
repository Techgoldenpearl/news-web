"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => { publicApi.articles({ contentType: "video", limit: 20 }).then((r) => setVideos(r.data.items)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">वीडियो न्यूज़</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => <NewsCard key={v.id} {...v} />)}
      </div>
      {videos.length === 0 && <p className="text-center text-gray-500 py-12">No videos available</p>}
    </div>
  );
}
