"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReporterAuth } from "@/lib/reporter-auth-context";
import Link from "next/link";
import { Newspaper, Mail, Lock, ArrowLeft, Languages } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { portalLoginSchema, fieldErrorsFrom } from "@/lib/auth-validation";

const t = {
  hi: {
    title: "पत्रकार पोर्टल",
    subtitle: "Journalist Portal",
    desc: "अपने खाते में लॉगिन करें",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "you@example.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    submit: "लॉगिन करें",
    submitting: "लॉगिन हो रहा है...",
    noAccount: "नया पत्रकार हैं?",
    register: "रजिस्टर करें",
    back: "समाचार साइट पर वापस जाएं",
    toggle: "English",
  },
  en: {
    title: "Journalist Portal",
    subtitle: "पत्रकार पोर्टल",
    desc: "Sign in to your account",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submit: "Sign In",
    submitting: "Signing in...",
    noAccount: "New journalist?",
    register: "Register",
    back: "Back to News Site",
    toggle: "हिंदी",
  },
};

export default function PatrakarLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { login, reporter } = useReporterAuth();
  const router = useRouter();
  const l = t[lang];

  useEffect(() => {
    if (reporter) router.replace("/patrakar/dashboard");
  }, [reporter, router]);

  if (reporter) return null;

  const validate = (values: { email: string; password: string }) =>
    fieldErrorsFrom(portalLoginSchema(lang).safeParse(values));

  const handleBlur = (field: "email" | "password") => {
    setTouched((tt) => ({ ...tt, [field]: true }));
    setFieldErrors(validate({ email, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });
    const errors = validate({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push("/patrakar/dashboard");
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
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition"
          >
            <Languages size={13} />
            {l.toggle}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-tint rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="text-brand" size={28} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{l.title}</h1>
          <p className="text-brand font-medium text-sm mt-0.5">{l.subtitle}</p>
          <p className="text-gray-400 text-xs mt-2">{l.desc}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l.emailLabel}</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder={l.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition ${touched.email && fieldErrors.email ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            {touched.email && fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l.passwordLabel}</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <PasswordInput
                placeholder={l.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-brand outline-none transition ${touched.password && fieldErrors.password ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            {touched.password && fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition text-sm mt-2"
          >
            {loading ? l.submitting : l.submit}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-center">
          <p className="text-sm text-gray-500">
            {l.noAccount}{" "}
            <Link href="/patrakar/register" className="text-brand font-semibold hover:underline">
              {l.register}
            </Link>
          </p>
          <p className="text-xs">
            <Link href="/home" className="text-gray-400 hover:text-brand flex items-center justify-center gap-1">
              <ArrowLeft size={12} /> {l.back}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
