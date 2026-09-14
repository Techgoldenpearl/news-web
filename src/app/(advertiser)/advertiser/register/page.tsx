"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdvertiserAuth } from "@/lib/advertiser-auth-context";
import { advertiserAuthApi } from "@/lib/advertiser-api";
import Link from "next/link";
import { Megaphone, ArrowLeft, Languages } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { advertiserRegisterSchema, fieldErrorsFrom } from "@/lib/auth-validation";

const t = {
  hi: {
    title: "विज्ञापनदाता पंजीकरण",
    subtitle: "Advertiser Registration",
    desc: "अपने व्यवसाय के लिए विज्ञापन शुरू करें",
    toggle: "English",
    companyName: "कंपनी का नाम", companyNamePh: "आपकी कंपनी / व्यवसाय का नाम",
    contactName: "संपर्क व्यक्ति", contactNamePh: "संपर्क व्यक्ति का नाम",
    email: "ईमेल", emailPh: "you@example.com",
    password: "पासवर्ड", passwordPh: "न्यूनतम 8 अक्षर",
    phone: "मोबाइल", phonePh: "10 अंकों का नंबर",
    gst: "GST नंबर (वैकल्पिक)", gstPh: "22AAAAA0000A1Z5",
    website: "वेबसाइट (वैकल्पिक)", websitePh: "https://yoursite.com",
    submit: "रजिस्टर करें", submitting: "जमा हो रहा है...",
    hasAccount: "पहले से खाता है?", login: "लॉगिन करें",
    back: "वापस जाएं",
  },
  en: {
    title: "Advertiser Registration",
    subtitle: "विज्ञापनदाता पंजीकरण",
    desc: "Start advertising for your business",
    toggle: "हिंदी",
    companyName: "Company Name", companyNamePh: "Your company / business name",
    contactName: "Contact Person", contactNamePh: "Contact person name",
    email: "Email", emailPh: "you@example.com",
    password: "Password", passwordPh: "Minimum 8 characters",
    phone: "Mobile", phonePh: "10-digit number",
    gst: "GST Number (optional)", gstPh: "22AAAAA0000A1Z5",
    website: "Website (optional)", websitePh: "https://yoursite.com",
    submit: "Register", submitting: "Submitting...",
    hasAccount: "Already have an account?", login: "Login",
    back: "Go back",
  },
};

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition bg-white placeholder:text-gray-300";

export default function AdvertiserRegisterPage() {
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", password: "", phone: "", gstNumber: "", website: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { refresh } = useAdvertiserAuth();
  const router = useRouter();
  const l = t[lang];

  const validate = (values: typeof form) =>
    fieldErrorsFrom(advertiserRegisterSchema(lang).safeParse(values));

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (touched[k]) setFieldErrors(validate(next));
  };

  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) };
    setForm(next);
    if (touched.phone) setFieldErrors(validate(next));
  };

  const handleBlur = (field: string) => {
    setTouched((tt) => ({ ...tt, [field]: true }));
    setFieldErrors(validate(form));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ companyName: true, contactName: true, email: true, password: true, phone: true, website: true });
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await advertiserAuthApi.register(form);
      await refresh();
      router.push("/advertiser/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const fieldClass = (field: string) =>
    `${inp} ${touched[field] && fieldErrors[field] ? "border-red-400" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">

        {/* Language toggle */}
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
            <Megaphone className="text-brand" size={22} />
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

            {/* Company + Contact */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.companyName}</label>
              <input placeholder={l.companyNamePh} value={form.companyName} onChange={set("companyName")} onBlur={() => handleBlur("companyName")} className={fieldClass("companyName")} />
              {touched.companyName && fieldErrors.companyName && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.contactName}</label>
              <input placeholder={l.contactNamePh} value={form.contactName} onChange={set("contactName")} onBlur={() => handleBlur("contactName")} className={fieldClass("contactName")} />
              {touched.contactName && fieldErrors.contactName && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactName}</p>}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.email}</label>
              <input type="email" placeholder={l.emailPh} value={form.email} onChange={set("email")} onBlur={() => handleBlur("email")} className={fieldClass("email")} />
              {touched.email && fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password + Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.password}</label>
              <PasswordInput placeholder={l.passwordPh} value={form.password} onChange={set("password")} onBlur={() => handleBlur("password")} className={fieldClass("password")} />
              {touched.password && fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.phone}</label>
              <input type="tel" inputMode="numeric" placeholder={l.phonePh} value={form.phone} onChange={setPhone} onBlur={() => handleBlur("phone")} className={fieldClass("phone")} />
              {touched.phone && fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* GST + Website */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.gst}</label>
              <input placeholder={l.gstPh} value={form.gstNumber} onChange={set("gstNumber")} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{l.website}</label>
              <input type="url" placeholder={l.websitePh} value={form.website} onChange={set("website")} onBlur={() => handleBlur("website")} className={fieldClass("website")} />
              {touched.website && fieldErrors.website && <p className="text-red-500 text-xs mt-1">{fieldErrors.website}</p>}
            </div>

          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white py-2.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition text-sm mt-4">
            {loading ? l.submitting : l.submit}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <p className="text-gray-500">
            {l.hasAccount}{" "}
            <Link href="/advertiser/login" className="text-brand font-semibold hover:underline">{l.login}</Link>
          </p>
          <Link href="/home" className="text-gray-400 hover:text-brand flex items-center gap-1">
            <ArrowLeft size={11} /> {l.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
