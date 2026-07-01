"use client";

import { useEffect, useState } from "react";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const { isHindi } = useSite();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (user) customerApi.bookmarks().then((r) => setBookmarks(r.data)).catch(() => {});
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Bookmark size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{isHindi ? "सहेजे गए लेख" : "Saved Articles"}</h1>
        <p className="text-gray-500 mb-4">{isHindi ? "अपने सहेजे गए लेख देखने के लिए लॉगिन करें" : "Login to see your bookmarked articles"}</p>
        <Link href="/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">{isHindi ? "लॉगिन" : "Login"}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bookmark size={24} /> {isHindi ? "सहेजे गए लेख" : "Saved Articles"} ({bookmarks.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookmarks.map((a) => <NewsCard key={a.id} {...a} />)}
      </div>
      {bookmarks.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "अभी तक कोई लेख सहेजा नहीं गया। किसी भी लेख पर बुकमार्क आइकन पर टैप करें।" : "No bookmarked articles yet. Tap the bookmark icon on any article to save it."}</p>}
    </div>
  );
}
