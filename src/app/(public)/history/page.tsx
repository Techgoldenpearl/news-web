"use client";

import { useEffect, useState } from "react";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const { isHindi } = useSite();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) customerApi.readingHistory().then((r) => setHistory(r.data)).catch(() => {});
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Clock size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{isHindi ? "पढ़ने का इतिहास" : "Reading History"}</h1>
        <p className="text-gray-500 mb-4">{isHindi ? "अपना पढ़ने का इतिहास देखने के लिए लॉगिन करें" : "Login to see your reading history"}</p>
        <Link href="/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">{isHindi ? "लॉगिन" : "Login"}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Clock size={24} /> {isHindi ? "पढ़ने का इतिहास" : "Reading History"}</h1>
      <div className="space-y-3">
        {history.map((h) => (
          <Link key={h.id} href={`/article/${h.slug}`} className="flex gap-4 bg-white rounded-xl border p-4 hover:shadow-md transition group">
            {h.thumbnailUrl && <img src={h.thumbnailUrl} alt={h.title} className="w-24 h-16 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 group-hover:text-brand transition line-clamp-1">{h.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{h.categoryName} · {isHindi ? "पढ़ा गया" : "Read"} {format(new Date(h.readAt), "dd MMM yyyy, h:mm a")}</p>
            </div>
          </Link>
        ))}
        {history.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "अभी तक कोई पढ़ने का इतिहास नहीं" : "No reading history yet"}</p>}
      </div>
    </div>
  );
}
