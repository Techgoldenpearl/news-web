"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { reporterSubmissionsApi } from "@/lib/reporter-api";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";

function NewSubmissionForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", titleHindi: "", summary: "", content: "",
    categoryId: "", thumbnailUrl: "", location: "", state: "", city: "", isUrgent: false,
  });

  useEffect(() => {
    publicApi.categories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const submit = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("शीर्षक और सामग्री आवश्यक है");
      return;
    }
    if (!isDraft && !form.categoryId) {
      toast.error("समीक्षा के लिए जमा करने हेतु श्रेणी चुनें");
      return;
    }
    setSubmitting(true);
    try {
      await reporterSubmissionsApi.create({
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        isDraft,
      });
      toast.success(isDraft ? "ड्राफ़्ट सहेजा गया" : "लेख समीक्षा के लिए जमा किया गया");
      router.push("/patrakar/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "जमा करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">नया लेख जमा करें</h1>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक (English) *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक (हिंदी)</label>
            <input value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सारांश</label>
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2}
            className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-300 focus:border-brand" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सामग्री *</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10}
            placeholder="अपना लेख यहाँ लिखें..."
            className="w-full px-3 py-2.5 border rounded-lg text-sm resize-y focus:ring-2 focus:ring-orange-300 focus:border-brand" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी *</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-300 focus:border-brand">
              <option value="">चुनें...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameHindi || c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">थंबनेल URL</label>
            <input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              placeholder="https://..." className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">स्थान</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">शहर</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">राज्य</label>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
          तत्काल / ब्रेकिंग न्यूज़
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={() => submit(true)} disabled={submitting}
            className="px-5 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
            ड्राफ़्ट सहेजें
          </button>
          <button onClick={() => submit(false)} disabled={submitting}
            className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
            {submitting ? "जमा हो रहा है..." : "समीक्षा के लिए जमा करें"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewSubmissionPage() {
  return (
    <ReporterGate>
      <NewSubmissionForm />
    </ReporterGate>
  );
}
