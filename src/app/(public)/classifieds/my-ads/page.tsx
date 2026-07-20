"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { format } from "date-fns";
import { Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  paused: "bg-blue-100 text-blue-700",
};

export default function MyClassifiedsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isHindi } = useSite();
  const [ads, setAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      customerApi.myClassifieds()
        .then((r) => setAds(r.data))
        .catch(() => {})
        .finally(() => setLoadingAds(false));
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isHindi ? "मेरे विज्ञापन" : "My Ads"}</h1>
        <Link href="/classifieds/post" className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> {isHindi ? "नया विज्ञापन" : "Post New Ad"}
        </Link>
      </div>

      {loadingAds ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-brand mx-auto" /></div>
      ) : ads.length === 0 ? (
        <p className="text-center text-gray-400 py-12">{isHindi ? "अभी तक कोई विज्ञापन नहीं" : "No ads submitted yet"}</p>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{isHindi ? (ad.titleHindi || ad.title) : ad.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{ad.city || ad.state || ""} · {format(new Date(ad.createdAt), "dd MMM yyyy")}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${STATUS_COLORS[ad.status] || "bg-gray-100 text-gray-500"}`}>
                  {ad.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
