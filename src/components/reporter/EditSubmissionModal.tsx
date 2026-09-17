"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Eye } from "lucide-react";
import { publicApi } from "@/lib/api";
import { dedupeCategories } from "@/lib/categories";
import { reporterSubmissionsApi } from "@/lib/reporter-api";
import { toast } from "sonner";

interface Submission {
  id: number;
  title: string;
  titleHindi?: string;
  summary?: string;
  content: string;
  categoryId?: number | null;
  thumbnailUrl?: string;
  location?: string;
  city?: string;
  state?: string;
  status: string;
  isUrgent?: boolean;
}

export function EditSubmissionModal({ submission, onClose, onSaved, readOnly = false }: { submission: Submission | null; onClose: () => void; onSaved: () => void; readOnly?: boolean }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", titleHindi: "", summary: "", content: "",
    categoryId: "", thumbnailUrl: "", location: "", city: "", state: "", isUrgent: false, isDraft: false,
  });

  useEffect(() => {
    publicApi.categories().then((r) => setCategories(dedupeCategories(r.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!submission) return;
    setForm({
      title: submission.title || "",
      titleHindi: submission.titleHindi || "",
      summary: submission.summary || "",
      content: submission.content || "",
      categoryId: submission.categoryId ? String(submission.categoryId) : "",
      thumbnailUrl: submission.thumbnailUrl || "",
      location: submission.location || "",
      city: submission.city || "",
      state: submission.state || "",
      isUrgent: !!submission.isUrgent,
      isDraft: submission.status === "draft",
    });
  }, [submission]);

  if (!submission) return null;

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("शीर्षक और सामग्री आवश्यक है");
      return;
    }
    setSaving(true);
    try {
      const { isDraft, ...data } = form;
      await reporterSubmissionsApi.update(submission.id, {
        ...data,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        isDraft,
      });
      toast.success("लेख अपडेट किया गया");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "अपडेट करने में विफल");
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = "w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand disabled:bg-gray-50 disabled:text-gray-600";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {readOnly ? <><Eye size={18} className="text-brand" /> लेख देखें</> : <><Pencil size={18} className="text-brand" /> लेख संपादित करें</>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक (English) *</label>
              <input disabled={readOnly} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक (हिंदी)</label>
              <input disabled={readOnly} value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })} className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी (CATEGORY) *</label>
              <select disabled={readOnly} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={`${fieldCls} bg-white`}>
                <option value="">चुनें...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nameHindi || c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">STATUS *</label>
              {readOnly || submission.status === "approved" ? (
                <input disabled value={submission.status === "approved" ? "Published" : submission.status} className={fieldCls} />
              ) : (
                <select value={form.isDraft ? "draft" : "pending"} onChange={(e) => setForm({ ...form, isDraft: e.target.value === "draft" })}
                  className={`${fieldCls} bg-white`}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">विवरण (DESCRIPTION) *</label>
            <textarea disabled={readOnly} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2}
              className={`${fieldCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">सामग्री (CONTENT) *</label>
            <textarea disabled={readOnly} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8}
              className={`${fieldCls} resize-y`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">थंबनेल URL</label>
            <input disabled={readOnly} value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              placeholder="https://..." className={fieldCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">स्थान (LOCATION) *</label>
              <input disabled={readOnly} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={fieldCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">नगर (CITY) *</label>
              <input disabled={readOnly} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={fieldCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">राज्य (STATE) *</label>
            <input disabled={readOnly} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={fieldCls} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" disabled={readOnly} checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
            तत्काल / ब्रेकिंग न्यूज़
          </label>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t">
          {readOnly ? (
            <button onClick={onClose} className="px-5 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              बंद करें (Close)
            </button>
          ) : (
            <>
              <button onClick={onClose} disabled={saving}
                className="px-5 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
                रद्द करें (Cancel)
              </button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
                {saving ? "सहेजा जा रहा है..." : "सहेजें (Save)"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
