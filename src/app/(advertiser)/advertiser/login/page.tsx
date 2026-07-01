"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdvertiserAuth } from "@/lib/advertiser-auth-context";
import Link from "next/link";
import { Megaphone, Mail, Lock, ArrowLeft, Languages } from "lucide-react";

const t = {
  hi: {
    title: "विज्ञापनदाता पोर्टल",
    subtitle: "Advertiser Portal",
    desc: "अपने खाते में लॉगिन करें",
    toggle: "English",
    email: "ईमेल पता", emailPh: "you@example.com",
    password: "पासवर्ड", passwordPh: "••••••••",
    submit: "लॉगिन करें", submitting: "लॉगिन हो रहा है...",
    noAccount: "नया विज्ञापनदाता हैं?", register: "रजिस्टर करें",
    back: "समाचार साइट पर वापस जाएं",
  },
  en: {
    title: "Advertiser Portal",
    subtitle: "विज्ञापनदाता पोर्टल",
    desc: "Sign in to your account",
    toggle: "हिंदी",
    email: "Email Address", emailPh: "you@example.com",
    password: "Password", passwordPh: "••••••••",
    submit: "Sign In", submitting: "Signing in...",
    noAccount: "New advertiser?", register: "Register",
    back: "Back to News Site",
  },
};

export default function AdvertiserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const { login, advertiser } = useAdvertiserAuth();
  const router = useRouter();
  const l = t[lang];

  useEffect(() => {
    if (advertiser) router.replace("/advertiser/dashboard");
  }, [advertiser, router]);

  if (advertiser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/advertiser/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition"
          >
            <Languages size={12} /> {l.toggle}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-tint rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="text-brand" size={28} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{l.title}</h1>
          <p className="text-brand font-semibold text-sm mt-0.5">{l.subtitle}</p>
          <p className="text-gray-400 text-xs mt-1.5">{l.desc}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l.email}</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder={l.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l.password}</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" placeholder={l.passwordPh} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition text-sm mt-2">
            {loading ? l.submitting : l.submit}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs">
          <p className="text-sm text-gray-500">
            {l.noAccount}{" "}
            <Link href="/advertiser/register" className="text-brand font-semibold hover:underline">{l.register}</Link>
          </p>
          <Link href="/home" className="text-gray-400 hover:text-brand flex items-center gap-1">
            <ArrowLeft size={11} /> {l.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
