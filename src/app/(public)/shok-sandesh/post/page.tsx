"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { toast } from "sonner";

const TYPES = [
  { value: "shok_sandesh", label: "Shok Sandesh", labelHi: "शोक संदेश" },
  { value: "shradhanjali", label: "Shradhanjali", labelHi: "श्रद्धांजलि" },
  { value: "punyatithi", label: "Punyatithi", labelHi: "पुण्यतिथि" },
  { value: "uthavna", label: "Uthavna", labelHi: "उठावना" },
  { value: "terahvi", label: "Terahvi", labelHi: "तेरहवीं" },
  { value: "smriti_sandesh", label: "Smriti Sandesh", labelHi: "स्मृति संदेश" },
];

const emptyForm = {
  type: "shok_sandesh", deceasedName: "", deceasedNameHindi: "", deceasedAge: "",
  dateOfDeath: "", place: "", state: "", city: "", familyName: "", familyNameHindi: "",
  message: "", messageHindi: "", eventDetails: "", eventDetailsHindi: "",
  eventDate: "", eventPlace: "", packageType: "basic_text",
};

export default function PostShokSandeshPage() {
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
    publicApi.shokSandeshPackages().then((r) => setPackages(r.data)).catch(() => {});
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
    if (!form.deceasedName.trim() || !form.type) {
      toast.error(isHindi ? "नाम और प्रकार आवश्यक है" : "Name and type are required");
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.submitShokSandesh(form);
      toast.success(isHindi ? "समीक्षा के लिए जमा किया गया" : "Submitted for review");
      router.push("/shok-sandesh");
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "जमा करने में विफल" : "Failed to submit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{isHindi ? "शोक संदेश जमा करें" : "Submit an Obituary"}</h1>

      <form onSubmit={submit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "प्रकार *" : "Type *"}</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{isHindi ? t.labelHi : t.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "दिवंगत का नाम *" : "Deceased Name *"}</label>
            <input value={form.deceasedName} onChange={(e) => setForm({ ...form, deceasedName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "नाम (हिंदी)" : "Name (Hindi)"}</label>
            <input value={form.deceasedNameHindi} onChange={(e) => setForm({ ...form, deceasedNameHindi: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "आयु" : "Age"}</label>
            <input value={form.deceasedAge} onChange={(e) => setForm({ ...form, deceasedAge: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" type="number" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "मृत्यु तिथि" : "Date of Death"}</label>
            <input value={form.dateOfDeath} onChange={(e) => setForm({ ...form, dateOfDeath: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" type="date" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "परिवार का नाम" : "Family Name"}</label>
            <input value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "परिवार का नाम (हिंदी)" : "Family Name (Hindi)"}</label>
            <input value={form.familyNameHindi} onChange={(e) => setForm({ ...form, familyNameHindi: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "स्थान" : "Place"}</label>
            <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "संदेश" : "Message"}</label>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{isHindi ? "संदेश (हिंदी)" : "Message (Hindi)"}</label>
          <textarea value={form.messageHindi} onChange={(e) => setForm({ ...form, messageHindi: e.target.value })}
            rows={3} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "कार्यक्रम तिथि" : "Event Date"}</label>
            <input value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{isHindi ? "कार्यक्रम स्थल" : "Event Place"}</label>
            <input value={form.eventPlace} onChange={(e) => setForm({ ...form, eventPlace: e.target.value })}
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
