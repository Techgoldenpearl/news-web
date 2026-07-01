"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const { isHindi } = useSite();
  const q = searchParams.get("q") || "";
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length >= 2) {
      setLoading(true);
      publicApi.search(q)
        .then((r) => setArticles(r.data.items))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    } else {
      setArticles([]);
    }
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{isHindi ? "खोज परिणाम" : "Search"}: &ldquo;{q}&rdquo;</h1>
      {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a) => <NewsCard key={a.id} {...a} />)}
      </div>
      {!loading && articles.length === 0 && q.length >= 2 && (
        <p className="text-center text-gray-500 py-12">{isHindi ? "कोई परिणाम नहीं मिला" : "No results found"}</p>
      )}
      {!loading && q.length > 0 && q.length < 2 && (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कम से कम 2 अक्षर लिखें" : "Type at least 2 characters"}</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
