"use client";

import { useEffect, useState } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { EditSubmissionModal } from "@/components/reporter/EditSubmissionModal";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { reporterSubmissionsApi, reporterMiscApi } from "@/lib/reporter-api";
import { publicApi } from "@/lib/api";
import { dedupeCategories } from "@/lib/categories";
import { Clock, PenSquare, Inbox, Search, MapPin, Calendar, Folder, Pencil, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending Review", cls: "bg-amber-100 text-amber-700" },
  under_review: { label: "Pending Review", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Published", cls: "bg-green-100 text-green-700" },
  rejected: { label: "अस्वीकृत", cls: "bg-red-100 text-red-700" },
  revision_requested: { label: "संशोधन आवश्यक", cls: "bg-purple-100 text-purple-700" },
};

const NON_EDITABLE_STATUSES = new Set(["rejected"]);

function StatCard({ icon, iconBg, value, label }: { icon: React.ReactNode; iconBg: string; value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-lg grid place-items-center text-lg shrink-0 ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-lg bg-gray-200" />
      <div className="space-y-1.5">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-5 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SubmissionRowSkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 animate-pulse">
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const { reporter } = useReporterAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("newest");

  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filterKey = JSON.stringify({ search, status, categoryId, date, sort });
  const submissionsLoading = loadedKey !== filterKey;

  const loadSubmissions = () => {
    reporterSubmissionsApi
      .list({
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        date: date || undefined,
        sort,
      })
      .then((r) => setSubmissions(r.data.items))
      .catch(() => setSubmissions([]))
      .finally(() => setLoadedKey(filterKey));
  };

  const loadStats = () => {
    reporterMiscApi.stats().then((r) => setStats(r.data)).catch(() => {});
  };

  useEffect(() => {
    const t = setTimeout(loadSubmissions, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, categoryId, date, sort]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { publicApi.categories().then((r) => setCategories(dedupeCategories(r.data))).catch(() => {}); }, []);

  const meta = [reporter?.designation, reporter?.beat, reporter?.city].filter(Boolean).join(" · ");

  const handleDelete = async (submission: any) => {
    const isPublished = submission.status === "approved";
    const message = isPublished
      ? "यह लेख वेबसाइट पर प्रकाशित है। हटाने पर यह साइट से भी हट जाएगा। क्या आप वाकई जारी रखना चाहते हैं?"
      : "क्या आप वाकई इस लेख को हटाना चाहते हैं?";
    if (!confirm(message)) return;
    setDeletingId(submission.id);
    try {
      await reporterSubmissionsApi.delete(submission.id);
      toast.success("लेख हटा दिया गया");
      loadSubmissions();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "हटाने में विफल");
    } finally {
      setDeletingId(null);
    }
  };

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
            <StatCard icon="📝" iconBg="bg-blue-100" value={stats.draft ?? 0} label="Draft Articles" />
            <StatCard icon="⏳" iconBg="bg-amber-100" value={stats.pendingReview ?? 0} label="Pending Review" />
            <StatCard icon="✓" iconBg="bg-green-100" value={stats.published ?? 0} label="Published" />
          </>
        ) : (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Search size={15} /> फ़िल्टर करें</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">खोजें (SEARCH)</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="शीर्षक या कीवर्ड..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">STATUS</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="all">सभी Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">श्रेणी (CATEGORY)</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">सभी श्रेणियां</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameHindi || c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">तारीख (DATE)</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">आपके लेख</h2>
          <p className="text-xs text-gray-500">({submissions.length} Total)</p>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="newest">नवीनतम पहले</option>
          <option value="oldest">सबसे पुराने पहले</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {submissionsLoading ? (
          <>
            <SubmissionRowSkeleton /><SubmissionRowSkeleton /><SubmissionRowSkeleton />
          </>
        ) : submissions.length > 0 ? (
          submissions.map((s) => {
            const editable = !NON_EDITABLE_STATUSES.has(s.status);
            const location = [s.location, s.state].filter(Boolean).join(", ") || [s.city, s.state].filter(Boolean).join(", ");
            return (
              <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {s.isUrgent && <Clock size={12} className="text-red-500" />}
                    <h3 className="font-bold text-[15px] text-gray-900">{s.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
                    {location && <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(s.createdAt), "d/M/yyyy")}</span>
                    {(s.categoryNameHindi || s.categoryName) && <span className="flex items-center gap-1"><Folder size={12} /> {s.categoryNameHindi || s.categoryName}</span>}
                  </div>
                  {s.adminNote && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2 inline-block">संपादक टिप्पणी: {s.adminNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded font-medium ${STATUS_LABEL[s.status]?.cls || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[s.status]?.label || s.status}
                  </span>
                  {editable && (
                    <button onClick={() => setEditing(s)} className="flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  <button onClick={() => setViewing(s)} className="flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                    <Eye size={13} /> View
                  </button>
                  {editable && (
                    <button onClick={() => handleDelete(s)} disabled={deletingId === s.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 transition">
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Inbox size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {status === "all" && !search && !categoryId && !date ? "अभी तक कोई लेख नहीं" : "इस फ़िल्टर में कोई लेख नहीं मिला"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {status === "all" && !search && !categoryId && !date ? "अपना पहला लेख जमा करके शुरुआत करें" : "फ़िल्टर बदलें या नया लेख जमा करें"}
            </p>
            <Link href="/patrakar/submissions/new" className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
              <PenSquare size={15} /> नया लेख जमा करें
            </Link>
          </div>
        )}
      </div>

      <EditSubmissionModal
        submission={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { loadSubmissions(); loadStats(); }}
      />
      <EditSubmissionModal
        submission={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => {}}
        readOnly
      />
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
