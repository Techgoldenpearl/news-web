"use client";

import { useState } from "react";
import { reporterAuthApi } from "@/lib/reporter-api";
import Link from "next/link";
import { Newspaper, CheckCircle2, ArrowLeft, Languages } from "lucide-react";

const t = {
  hi: {
    title: "पत्रकार पंजीकरण",
    subtitle: "Journalist Registration",
    desc: "स्थानीय पत्रकार के रूप में आवेदन करें",
    toggle: "English",
    name: "पूरा नाम", namePh: "अपना पूरा नाम लिखें",
    email: "ईमेल", emailPh: "you@example.com",
    password: "पासवर्ड", passwordPh: "न्यूनतम 8 अक्षर",
    phone: "मोबाइल", phonePh: "10 अंकों का नंबर",
    designation: "पदनाम", designationPh: "पत्रकार, संवाददाता...",
    beat: "बीट", beatPh: "बीट चुनें",
    city: "शहर", cityPh: "शहर",
    state: "राज्य", statePh: "राज्य",
    submit: "आवेदन जमा करें", submitting: "जमा हो रहा है...",
    hasAccount: "पहले से खाता है?", login: "लॉगिन करें",
    back: "वापस जाएं",
    doneTitle: "आवेदन प्राप्त हुआ!",
    doneIdLabel: "आपका Employee ID",
    doneMsg: "स्वीकृति के बाद आप लॉगिन कर सकेंगे।",
    doneBtn: "लॉगिन करें",
  },
  en: {
    title: "Journalist Registration",
    subtitle: "पत्रकार पंजीकरण",
    desc: "Apply as a local journalist",
    toggle: "हिंदी",
    name: "Full Name", namePh: "Enter your full name",
    email: "Email", emailPh: "you@example.com",
    password: "Password", passwordPh: "Minimum 8 characters",
    phone: "Mobile", phonePh: "10-digit number",
    designation: "Designation", designationPh: "Journalist, Correspondent...",
    beat: "Beat", beatPh: "Select Beat",
    city: "City", cityPh: "Your city",
    state: "State", statePh: "Your state",
    submit: "Submit Application", submitting: "Submitting...",
    hasAccount: "Already have an account?", login: "Login",
    back: "Go back",
    doneTitle: "Application Received!",
    doneIdLabel: "Your Employee ID",
    doneMsg: "You can login after your application is approved.",
    doneBtn: "Go to Login",
  },
};

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition bg-white placeholder:text-gray-300";
const sel = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition bg-white text-gray-700";

const BEATS_HI = ["राजनीति", "खेल", "अपराध", "मनोरंजन", "व्यापार", "शिक्षा", "स्वास्थ्य", "कृषि", "धर्म", "विज्ञान", "अंतर्राष्ट्रीय", "स्थानीय", "अन्य"];
const BEATS_EN = ["Politics", "Sports", "Crime", "Entertainment", "Business", "Education", "Health", "Agriculture", "Religion", "Science", "International", "Local", "Other"];

export default function PatrakarRegisterPage() {
  const [form, setForm] = useState({
    name: "", nameHindi: "", email: "", password: "", phone: "",
    designation: "", beat: "", city: "", state: "", bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ employeeId: string } | null>(null);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const l = t[lang];

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await reporterAuthApi.register(form);
      setDone({ employeeId: res.data.employeeId });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={30} className="text-green-500" />
          </div>
          <h1 className="text-lg font-black text-gray-900 mb-1">{l.doneTitle}</h1>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 my-4">
            <p className="text-xs text-gray-400 mb-1">{l.doneIdLabel}</p>
            <p className="font-mono font-black text-2xl text-brand">{done.employeeId}</p>
          </div>
          <p className="text-gray-500 text-sm mb-5">{l.doneMsg}</p>
          <Link href="/patrakar/login" className="block bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition text-sm">
            {l.doneBtn}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">

        {/* Top row: toggle */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition"
          >
            <Languages size={12} /> {l.toggle}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-brand-tint rounded-xl flex items-center justify-center shrink-0">
            <Newspaper className="text-brand" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">{l.title}</h1>
            <p className="text-brand font-semibold text-xs">{l.subtitle}</p>
            <p className="text-gray-400 text-xs">{l.desc}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">

            {/* Full Name - full width */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.name}</label>
              <input placeholder={l.namePh} value={form.name} onChange={set("name")} required className={inp} />
            </div>

            {/* Email - full width */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.email}</label>
              <input type="email" placeholder={l.emailPh} value={form.email} onChange={set("email")} required className={inp} />
            </div>

            {/* Password + Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.password}</label>
              <input type="password" placeholder={l.passwordPh} value={form.password} onChange={set("password")} required minLength={8} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.phone}</label>
              <input type="tel" placeholder={l.phonePh} value={form.phone} onChange={set("phone")} className={inp} />
            </div>

            {/* Designation + Beat */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.designation}</label>
              <input placeholder={l.designationPh} value={form.designation} onChange={set("designation")} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.beat}</label>
              <select value={form.beat} onChange={(e) => setForm({ ...form, beat: e.target.value })} className={sel}>
                <option value="">{l.beatPh}</option>
                {(lang === "hi" ? BEATS_HI : BEATS_EN).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* City + State */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.city}</label>
              <input placeholder={l.cityPh} value={form.city} onChange={set("city")} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.state}</label>
              <input placeholder={l.statePh} value={form.state} onChange={set("state")} className={inp} />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-2.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition text-sm mt-4"
          >
            {loading ? l.submitting : l.submit}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <p className="text-gray-500">
            {l.hasAccount}{" "}
            <Link href="/patrakar/login" className="text-brand font-semibold hover:underline">{l.login}</Link>
          </p>
          <Link href="/home" className="text-gray-400 hover:text-brand flex items-center gap-1">
            <ArrowLeft size={11} /> {l.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
