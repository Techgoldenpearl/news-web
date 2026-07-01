"use client";

import { useEffect, useState } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { reporterSubmissionsApi, reporterMiscApi } from "@/lib/reporter-api";
import { FileText, CheckCircle2, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "ड्राफ़्ट", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "समीक्षा में", cls: "bg-amber-100 text-amber-700" },
  under_review: { label: "समीक्षाधीन", cls: "bg-blue-100 text-blue-700" },
  approved: { label: "स्वीकृत", cls: "bg-green-100 text-green-700" },
  rejected: { label: "अस्वीकृत", cls: "bg-red-100 text-red-700" },
  revision_requested: { label: "संशोधन आवश्यक", cls: "bg-purple-100 text-purple-700" },
};

function DashboardContent() {
  const { reporter } = useReporterAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    reporterSubmissionsApi.list({ status: filter === "all" ? undefined : filter }).then((r) => setSubmissions(r.data.items)).catch(() => {});
  }, [filter]);

  useEffect(() => {
    reporterMiscApi.stats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">नमस्ते, {reporter?.nameHindi || reporter?.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{reporter?.designation} · {reporter?.beat} · {reporter?.city}</p>
        </div>
        <Link href="/patrakar/submissions/new" className="bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition">
          + नया लेख जमा करें
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg"><FileText size={18} className="text-blue-600" /></div>
          <div><p className="text-xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-gray-500">कुल लेख</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-lg"><CheckCircle2 size={18} className="text-green-600" /></div>
          <div><p className="text-xl font-bold">{stats?.approved ?? 0}</p><p className="text-xs text-gray-500">स्वीकृत</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-lg"><Eye size={18} className="text-purple-600" /></div>
          <div><p className="text-xl font-bold">{stats?.totalViews ?? 0}</p><p className="text-xs text-gray-500">कुल व्यूज़</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "draft", "pending", "approved", "rejected", "revision_requested"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === s ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s === "all" ? "सभी" : STATUS_LABEL[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {submissions.map((s) => (
          <div key={s.id} className="p-4 flex items-start gap-3">
            {s.thumbnailUrl && <img src={s.thumbnailUrl} alt={s.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_LABEL[s.status]?.cls || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABEL[s.status]?.label || s.status}
                </span>
                {s.isUrgent && <Clock size={12} className="text-red-500" />}
                {s.categoryName && <span className="text-xs text-gray-400">{s.categoryName}</span>}
              </div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{s.title}</h3>
              {s.summary && <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{s.summary}</p>}
              {s.adminNote && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2 inline-block">संपादक टिप्पणी: {s.adminNote}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {s.submittedAt ? format(new Date(s.submittedAt), "dd MMM yyyy, h:mm a", { locale: hi }) : "ड्राफ़्ट"}
              </p>
            </div>
          </div>
        ))}
        {submissions.length === 0 && <p className="text-center text-gray-400 py-12">कोई लेख नहीं मिला</p>}
      </div>
    </div>
  );
}

export default function PatrakarDashboardPage() {
  return (
    <ReporterGate>
      <DashboardContent />
    </ReporterGate>
  );
}
