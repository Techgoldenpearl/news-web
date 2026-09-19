"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { loginSchema, registerSchema, fieldErrorsFrom } from "@/lib/auth-validation";
import PasswordInput from "@/components/PasswordInput";
import { Modal } from "./Modal";

type Mode = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

// Reader-only fast path — पत्रकार/विज्ञापनदाता use their own dedicated
// login pages (linked from AccountMenu/Footer) since those sessions live
// in separate contexts not mounted on the public site (see AccountMenu.tsx).
export function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const { isHindi } = useSite();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(""); setFieldErrors({}); setAgreedToTerms(false); };

  // AccountMenu keeps this modal mounted at all times (only `open` toggles),
  // so `initialMode` changing on a later click was never picked up after the
  // very first open — `useState(initialMode)` only reads it once. Re-sync
  // `mode` every time the modal is (re)opened.
  useEffect(() => {
    if (open) { setMode(initialMode); setError(""); setFieldErrors({}); setAgreedToTerms(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMode]);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = loginSchema.safeParse(loginForm);
    const errors = fieldErrorsFrom(result);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || (isHindi ? "लॉगिन विफल" : "Login failed"));
    } finally { setLoading(false); }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = registerSchema.safeParse(signupForm);
    const errors = fieldErrorsFrom(result);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!agreedToTerms) {
      setError(isHindi ? "कृपया जारी रखने के लिए गोपनीयता नीति और उपयोग की शर्तों से सहमत हों" : "Please agree to the Privacy Policy and Terms of Use to continue");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = signupForm;
      await register(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || (isHindi ? "खाता बनाना विफल" : "Registration failed"));
    } finally { setLoading(false); }
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${fieldErrors[field] ? "border-red-400" : "border-line"}`;

  return (
    <Modal open={open} onClose={onClose} title={mode === "login" ? (isHindi ? "लॉगिन" : "Login") : (isHindi ? "नया खाता" : "New Account")}>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">{error}</div>}

      {mode === "login" ? (
        <form onSubmit={submitLogin} noValidate className="space-y-3.5">
          <div>
            <input type="email" placeholder={isHindi ? "ईमेल" : "Email"} value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
              className={fieldClass("email")} />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <PasswordInput placeholder={isHindi ? "पासवर्ड" : "Password"} value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              className={fieldClass("password")} />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div className="text-right -mt-1">
            <Link href="/forgot-password" onClick={onClose} className="text-sm text-brand font-medium">{isHindi ? "पासवर्ड भूल गए?" : "Forgot password?"}</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition">
            {loading ? (isHindi ? "लॉगिन हो रहा है…" : "Signing in…") : (isHindi ? "लॉगिन करें" : "Sign In")}
          </button>
        </form>
      ) : (
        <form onSubmit={submitSignup} noValidate className="space-y-3.5">
          <div>
            <input placeholder={isHindi ? "पूरा नाम" : "Full Name"} value={signupForm.name}
              onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
              className={fieldClass("name")} />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <input type="email" placeholder={isHindi ? "ईमेल" : "Email"} value={signupForm.email}
              onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
              className={fieldClass("email")} />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <input placeholder={isHindi ? "फ़ोन (वैकल्पिक)" : "Phone (optional)"} value={signupForm.phone} inputMode="numeric"
              onChange={(e) => setSignupForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              className={fieldClass("phone")} />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <PasswordInput placeholder={isHindi ? "पासवर्ड (कम से कम 8 अक्षर)" : "Password (min 8 chars)"} value={signupForm.password}
              onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
              className={fieldClass("password")} />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <PasswordInput placeholder={isHindi ? "पासवर्ड की पुष्टि करें" : "Confirm Password"} value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className={fieldClass("confirmPassword")} />
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>
          <label className="flex items-start gap-2.5 text-sm text-tx-2 cursor-pointer">
            <input type="checkbox" checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-brand" />
            <span>
              {isHindi ? (
                <>मैं <Link href="/privacy" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand font-medium underline underline-offset-2">गोपनीयता नीति</Link> और <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand font-medium underline underline-offset-2">उपयोग की शर्तों</Link> से सहमत हूँ</>
              ) : (
                <>I agree to the <Link href="/privacy" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand font-medium underline underline-offset-2">Privacy Policy</Link> and <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand font-medium underline underline-offset-2">Terms of Use</Link></>
              )}
            </span>
          </label>
          <button type="submit" disabled={loading || !agreedToTerms} className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition">
            {loading ? (isHindi ? "बन रहा है…" : "Creating…") : (isHindi ? "खाता बनाएँ" : "Create Account")}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-tx-3 mt-4">
        {mode === "login" ? (
          <>{isHindi ? "खाता नहीं है?" : "Don't have an account?"} <button onClick={() => switchMode("signup")} className="text-brand font-medium underline underline-offset-2">{isHindi ? "नया खाता" : "Register"}</button></>
        ) : (
          <>{isHindi ? "पहले से खाता है?" : "Already have an account?"} <button onClick={() => switchMode("login")} className="text-brand font-medium underline underline-offset-2">{isHindi ? "लॉगिन करें" : "Sign In"}</button></>
        )}
      </p>
    </Modal>
  );
}
