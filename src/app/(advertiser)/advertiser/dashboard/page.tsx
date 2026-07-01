"use client";

import { useEffect, useState } from "react";
import { AdvertiserGate } from "@/components/advertiser/AdvertiserGate";
import { useAdvertiserAuth } from "@/lib/advertiser-auth-context";
import { advertiserRequestsApi } from "@/lib/advertiser-api";
import { Megaphone, Eye, MousePointerClick, Percent, Clock } from "lucide-react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "ड्राफ़्ट", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "समीक्षा में", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "स्वीकृत", cls: "bg-green-100 text-green-700" },
  rejected: { label: "अस्वीकृत", cls: "bg-red-100 text-red-700" },
  paused: { label: "रोका गया", cls: "bg-gray-100 text-gray-600" },
};

function DashboardContent() {
  const { advertiser } = useAdvertiserAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    advertiserRequestsApi.list().then((r) => setRequests(r.data)).catch(() => {});
    advertiserRequestsApi.stats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">नमस्ते, {advertiser?.companyName}</h1>
          {advertiser?.status === "pending" && (
            <p className="text-amber-600 text-sm mt-1 flex items-center gap-1.5">
              <Clock size={14} /> आपका खाता समीक्षा में है। स्वीकृति के बाद आप विज्ञापन जमा कर सकेंगे।
            </p>
          )}
        </div>
        {advertiser?.status === "active" && (
          <Link href="/advertiser/requests/new" className="bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition">
            + नया विज्ञापन जमा करें
          </Link>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg"><Megaphone size={18} className="text-blue-600" /></div>
          <div><p className="text-xl font-bold">{stats?.activeAds ?? 0}/{stats?.totalAds ?? 0}</p><p className="text-xs text-gray-500">सक्रिय/कुल विज्ञापन</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-lg"><Eye size={18} className="text-purple-600" /></div>
          <div><p className="text-xl font-bold">{stats?.totalImpressions ?? 0}</p><p className="text-xs text-gray-500">इंप्रेशन</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-lg"><MousePointerClick size={18} className="text-green-600" /></div>
          <div><p className="text-xl font-bold">{stats?.totalClicks ?? 0}</p><p className="text-xs text-gray-500">क्लिक्स</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-lg"><Percent size={18} className="text-amber-600" /></div>
          <div><p className="text-xl font-bold">{stats?.ctr ?? 0}%</p><p className="text-xs text-gray-500">CTR</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {requests.map((r) => (
          <div key={r.id} className="p-4 flex items-start gap-3">
            {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_LABEL[r.status]?.cls || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABEL[r.status]?.label || r.status}
                </span>
                <span className="text-xs text-gray-400">{r.zone}</span>
              </div>
              <h3 className="font-medium text-gray-900">{r.name}</h3>
              {r.budget && <p className="text-sm text-gray-500 mt-0.5">बजट: ₹{r.budget}</p>}
              {r.adminNote && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2 inline-block">टिप्पणी: {r.adminNote}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{format(new Date(r.createdAt), "dd MMM yyyy", { locale: hi })}</p>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="text-center text-gray-400 py-12">कोई विज्ञापन अनुरोध नहीं मिला</p>}
      </div>
    </div>
  );
}

export default function AdvertiserDashboardPage() {
  return (
    <AdvertiserGate>
      <DashboardContent />
    </AdvertiserGate>
  );
}
