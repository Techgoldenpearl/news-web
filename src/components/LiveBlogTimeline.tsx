"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { format } from "date-fns";
import { Radio } from "lucide-react";

export function LiveBlogTimeline({ articleId }: { articleId: number }) {
  const { isHindi } = useSite();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const load = () => {
      publicApi.liveBlog(articleId).then((r) => {
        setBlog(r.data);
        if (!r.data?.isLive && interval) {
          clearInterval(interval);
          interval = null;
        }
      }).catch(() => {});
    };

    load();
    interval = setInterval(load, 15000);
    return () => { if (interval) clearInterval(interval); };
  }, [articleId]);

  if (!blog) return null;

  return (
    <div className="mb-6 rounded-xl border bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
        {blog.isLive ? (
          <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm uppercase">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            {isHindi ? "लाइव" : "Live"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
            <Radio size={14} />
            {isHindi ? "लाइव ब्लॉग समाप्त" : "Live blog ended"}
          </span>
        )}
      </div>

      <div className="divide-y max-h-[500px] overflow-y-auto">
        {(blog.entries || []).map((e: any) => (
          <div key={e.id} className={`px-4 py-3 ${e.isHighlight ? "bg-brand-tint border-l-4 border-brand" : ""}`}>
            <p className="text-xs text-gray-400 mb-1">
              {e.postedAt ? format(new Date(e.postedAt), "dd MMM yyyy, h:mm a") : ""}
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {isHindi ? (e.contentHindi || e.content) : e.content}
            </p>
            {e.imageUrl && (
              <img src={e.imageUrl} alt="" className="mt-2 rounded-lg max-h-64 object-cover" />
            )}
          </div>
        ))}
        {(blog.entries || []).length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            {isHindi ? "अभी तक कोई अपडेट नहीं" : "No updates yet"}
          </p>
        )}
      </div>
    </div>
  );
}
