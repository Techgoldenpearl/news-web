"use client";

import { useEffect, useState } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import { reporterAuthApi } from "@/lib/reporter-api";
import { toast } from "sonner";

function ProfileForm() {
  const { reporter, refresh } = useReporterAuth();
  const [form, setForm] = useState({
    nameHindi: "", phone: "", designation: "", beat: "", city: "", state: "", bio: "", twitterHandle: "", facebookUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (reporter) {
      setForm({
        nameHindi: reporter.nameHindi || "", phone: reporter.phone || "", designation: reporter.designation || "",
        beat: reporter.beat || "", city: reporter.city || "", state: reporter.state || "",
        bio: reporter.bio || "", twitterHandle: reporter.twitterHandle || "", facebookUrl: reporter.facebookUrl || "",
      });
    }
  }, [reporter]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reporterAuthApi.updateProfile(form);
      await refresh();
      toast.success("प्रोफ़ाइल अपडेट हुई");
    } catch { toast.error("अपडेट विफल"); }
    finally { setSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) { toast.error("नया पासवर्ड कम से कम 8 अक्षर का हो"); return; }
    setPwSaving(true);
    try {
      await reporterAuthApi.changePassword(pw.currentPassword, pw.newPassword);
      toast.success("पासवर्ड बदला गया");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err: any) { toast.error(err.response?.data?.error || "पासवर्ड बदलने में विफल"); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">प्रोफ़ाइल सेटिंग्स</h1>

      <form onSubmit={saveProfile} className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">सामान्य जानकारी</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm text-gray-600 mb-1">नाम (हिंदी)</label>
            <input value={form.nameHindi} onChange={(e) => setForm({ ...form, nameHindi: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">फ़ोन</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm text-gray-600 mb-1">पदनाम</label>
            <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">बीट</label>
            <input value={form.beat} onChange={(e) => setForm({ ...form, beat: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm text-gray-600 mb-1">शहर</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">राज्य</label>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        </div>
        <div><label className="block text-sm text-gray-600 mb-1">परिचय</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm text-gray-600 mb-1">Twitter</label>
            <input value={form.twitterHandle} onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">Facebook URL</label>
            <input value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        </div>
        <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
          {saving ? "सहेजा जा रहा है..." : "सहेजें"}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">पासवर्ड बदलें</h2>
        <input type="password" placeholder="वर्तमान पासवर्ड" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required
          className="w-full px-3 py-2.5 border rounded-lg text-sm" />
        <input type="password" placeholder="नया पासवर्ड (कम से कम 8 अक्षर)" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8}
          className="w-full px-3 py-2.5 border rounded-lg text-sm" />
        <button type="submit" disabled={pwSaving} className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition">
          {pwSaving ? "बदला जा रहा है..." : "पासवर्ड बदलें"}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ReporterGate>
      <ProfileForm />
    </ReporterGate>
  );
}
