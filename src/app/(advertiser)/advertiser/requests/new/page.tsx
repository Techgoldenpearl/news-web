"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdvertiserGate } from "@/components/advertiser/AdvertiserGate";
import { useAdvertiserAuth } from "@/lib/advertiser-auth-context";
import { advertiserRequestsApi } from "@/lib/advertiser-api";
import { toast } from "sonner";
import Link from "next/link";

const ZONES = [
  { value: "header-leaderboard", label: "हेडर लीडरबोर्ड (728×90)" },
  { value: "breaking-below", label: "ब्रेकिंग न्यूज़ के नीचे" },
  { value: "sidebar-top", label: "साइडबार टॉप" },
  { value: "sidebar-middle", label: "साइडबार मिडिल" },
  { value: "in-article-1", label: "लेख के अंदर 1" },
  { value: "in-article-2", label: "लेख के अंदर 2" },
  { value: "footer-banner", label: "फूटर बैनर" },
  { value: "category-top", label: "श्रेणी पेज टॉप" },
  { value: "video-preroll", label: "वीडियो प्री-रोल" },
  { value: "popup", label: "पॉपअप" },
];

function NewRequestForm() {
  const router = useRouter();
  const { advertiser } = useAdvertiserAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", zone: "header-leaderboard", imageUrl: "", linkUrl: "", altText: "",
    width: "", height: "", budget: "", startDate: "", endDate: "",
  });

  if (advertiser?.status !== "active") {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <p className="text-gray-600">विज्ञापन जमा करने के लिए आपके खाते की स्वीकृति आवश्यक है।</p>
        <Link href="/advertiser/dashboard" className="inline-block mt-4 text-brand font-medium">डैशबोर्ड पर वापस जाएं</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.zone) {
      toast.error("नाम और ज़ोन आवश्यक है");
      return;
    }
    setSubmitting(true);
    try {
      await advertiserRequestsApi.create({
        ...form,
        width: form.width ? parseInt(form.width) : undefined,
        height: form.height ? parseInt(form.height) : undefined,
        budget: form.budget || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      toast.success("विज्ञापन अनुरोध जमा किया गया");
      router.push("/advertiser/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "जमा करने में विफल");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">नया विज्ञापन जमा करें</h1>

      <form onSubmit={submit} className="bg-white rounded-xl border p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">विज्ञापन का नाम *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ज़ोन *</label>
          <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}
            className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-300 focus:border-brand">
            {ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">इमेज URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..." className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">लिंक URL</label>
            <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://..." className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alt टेक्स्ट</label>
          <input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })}
            className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">चौड़ाई (px)</label>
            <input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ऊंचाई (px)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">बजट (₹)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">प्रारंभ तिथि</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">समाप्ति तिथि</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition">
          {submitting ? "जमा हो रहा है..." : "समीक्षा के लिए जमा करें"}
        </button>
      </form>
    </div>
  );
}

export default function NewAdRequestPage() {
  return (
    <AdvertiserGate>
      <NewRequestForm />
    </AdvertiserGate>
  );
}
