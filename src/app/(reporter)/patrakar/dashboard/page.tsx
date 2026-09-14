"use client";

import { useEffect, useState } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { reporterSubmissionsApi, reporterMiscApi } from "@/lib/reporter-api";
import { FileText, CheckCircle2, Eye, Clock, PenSquare, Inbox } from "lucide-react";
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

const FILTERS = ["all", "draft", "pending", "approved", "rejected", "revision_requested"];

function StatCard({ icon, iconBg, iconColor, value, label }: { icon: React.ReactNode; iconBg: string; iconColor: string; value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200" />
      <div className="space-y-1.5">
        <div className="h-5 w-8 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function SubmissionRowSkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const { reporter } = useReporterAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadedFilter, setLoadedFilter] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const submissionsLoading = loadedFilter !== filter;

  useEffect(() => {
    reporterSubmissionsApi
      .list({ status: filter === "all" ? undefined : filter })
      .then((r) => setSubmissions(r.data.items))
      .catch(() => setSubmissions([]))
      .finally(() => setLoadedFilter(filter));
  }, [filter]);

  useEffect(() => {
    reporterMiscApi.stats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const meta = [reporter?.designation, reporter?.beat, reporter?.city].filter(Boolean).join(" · ");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">नमस्ते, {reporter?.nameHindi || reporter?.name}</h1>
          {meta && <p className="text-gray-500 text-sm mt-0.5">{meta}</p>}
        </div>
        <Link href="/patrakar/submissions/new" className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shrink-0">
          <PenSquare size={16} /> नया लेख जमा करें
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats ? (
          <>
            <StatCard icon={<FileText size={18} />} iconBg="bg-blue-100" iconColor="text-blue-600" value={stats.total ?? 0} label="कुल लेख" />
            <StatCard icon={<CheckCircle2 size={18} />} iconBg="bg-green-100" iconColor="text-green-600" value={stats.approved ?? 0} label="स्वीकृत" />
            <StatCard icon={<Eye size={18} />} iconBg="bg-purple-100" iconColor="text-purple-600" value={stats.totalViews ?? 0} label="कुल व्यूज़" />
          </>
        ) : (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === s ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s === "all" ? "सभी" : STATUS_LABEL[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {submissionsLoading ? (
          <>
            <SubmissionRowSkeleton /><SubmissionRowSkeleton /><SubmissionRowSkeleton />
          </>
        ) : submissions.length > 0 ? (
          submissions.map((s) => (
            <div key={s.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition">
              {s.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.thumbnailUrl} alt={s.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Inbox size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {filter === "all" ? "अभी तक कोई लेख नहीं" : "इस श्रेणी में कोई लेख नहीं मिला"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {filter === "all" ? "अपना पहला लेख जमा करके शुरुआत करें" : "कोई दूसरी श्रेणी चुनें या नया लेख जमा करें"}
            </p>
            {filter === "all" && (
              <Link href="/patrakar/submissions/new" className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
                <PenSquare size={15} /> नया लेख जमा करें
              </Link>
            )}
          </div>
        )}
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
