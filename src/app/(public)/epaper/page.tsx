"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import Link from "next/link";
import { Newspaper } from "lucide-react";

export default function EpaperPage() {
  const { isHindi } = useSite();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.epaperIssues({ limit: 30 })
      .then((r) => setIssues(r.data.items || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "ई-पेपर" : "E-Paper"}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
        </div>
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {issues.map((issue) => (
            <Link key={issue.id} href={`/epaper/${issue.id}`} className="group">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-gray-100 border">
                {issue.coverImageUrl ? (
                  <img src={issue.coverImageUrl} alt={issue.issueDate} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Newspaper size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-medium mt-2">
                {new Date(issue.issueDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई ई-पेपर उपलब्ध नहीं" : "No e-paper issues available"}</p>
      )}
    </div>
  );
}
