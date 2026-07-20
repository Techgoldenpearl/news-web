"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "property", label: "Property", labelHi: "संपत्ति" },
  { value: "jobs", label: "Jobs", labelHi: "नौकरी" },
  { value: "business", label: "Business", labelHi: "व्यापार" },
  { value: "services", label: "Services", labelHi: "सेवाएं" },
  { value: "vehicles", label: "Vehicles", labelHi: "वाहन" },
  { value: "buy_sell", label: "Buy/Sell", labelHi: "खरीदें/बेचें" },
  { value: "matrimonial", label: "Matrimonial", labelHi: "वैवाहिक" },
  { value: "education", label: "Education", labelHi: "शिक्षा" },
  { value: "lost_found", label: "Lost & Found", labelHi: "खोया-पाया" },
  { value: "public_notice", label: "Public Notice", labelHi: "सार्वजनिक सूचना" },
];

const emptyForm = {
  category: "property", title: "", titleHindi: "", description: "", descriptionHindi: "",
  price: "", contactName: "", contactPhone: "", contactWhatsapp: "",
  state: "", city: "", area: "", packageType: "basic",
};

export default function PostClassifiedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isHindi } = useSite();
  const [form, setForm] = useState(emptyForm);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    publicApi.states().then((r) => setStates(r.data)).catch(() => {});
    publicApi.classifiedPackages().then((r) => setPackages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const matched = states.find((s) => s.name === form.state);
    if (matched) {
      publicApi.cities(matched.slug).then((r) => setCities(r.data?.cities || [])).catch(() => {});
    } else {
      setCities([]);
    }
  }, [form.state, states]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) {
      toast.error(isHindi ? "शीर्षक और श्रेणी आवश्यक है" : "Title and category are required");
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.submitClassified(form);
      toast.success(isHindi ? "विज्ञापन समीक्षा के लिए जमा किया गया" : "Ad submitted for review");
      router.push("/classifieds/my-ads");
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "जमा करने में विफल" : "Failed to submit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isHindi ? "विज्ञापन पोस्ट करें" : "Post an Ad"}</h1>
        <Link href="/classifieds/my-ads" className="text-sm text-brand hover:underline">{isHindi ? "मेरे विज्ञापन" : "My Ads"}</Link>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "श्रेणी *" : "Category *"}</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{isHindi ? c.labelHi : c.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शीर्षक *" : "Title *"}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शीर्षक (हिंदी)" : "Title (Hindi)"}</label>
            <input value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "विवरण" : "Description"}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "कीमत" : "Price"}</label>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg" placeholder="₹" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "राज्य" : "State"}</label>
            <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="">{isHindi ? "चुनें" : "Select"}</option>
              {states.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "शहर" : "City"}</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" disabled={!form.state}>
              <option value="">{isHindi ? "चुनें" : "Select"}</option>
              {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "क्षेत्र" : "Area"}</label>
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "संपर्क नाम" : "Contact Name"}</label>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "फ़ोन" : "Phone"}</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" placeholder="+91..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        {packages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "पैकेज" : "Package"}</label>
            <select value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg">
              {packages.map((p: any) => (
                <option key={p.id} value={p.slug || p.type}>{p.name} {p.price ? `– ₹${p.price}` : ""}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full px-6 py-2.5 bg-brand text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium">
          {submitting ? (isHindi ? "जमा हो रहा है..." : "Submitting...") : (isHindi ? "जमा करें" : "Submit for Review")}
        </button>
      </form>
    </div>
  );
}
