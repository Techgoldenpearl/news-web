"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { registerSchema, fieldErrorsFrom } from "@/lib/auth-validation";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  const validate = (values: typeof form) => fieldErrorsFrom(registerSchema.safeParse(values));

  const handleChange = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setFieldErrors(validate(next));
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors(validate(form));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.map((d: any) => d.message).join(", ") || "Registration failed");
    } finally { setLoading(false); }
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand ${touched[field] && fieldErrors[field] ? "border-red-400" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Create Account</h1>
        <p className="text-gray-500 text-center mb-6">Join our news platform</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <input placeholder="Full Name" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")}
              className={fieldClass("name")} />
            {touched.name && fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => handleChange("email", e.target.value)} onBlur={() => handleBlur("email")}
              className={fieldClass("email")} />
            {touched.email && fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <input placeholder="Phone (optional, 10 digits)" value={form.phone} inputMode="numeric"
              onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => handleBlur("phone")}
              className={fieldClass("phone")} />
            {touched.phone && fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <PasswordInput placeholder="Password (min 8 chars)" value={form.password}
              onChange={(e) => handleChange("password", e.target.value)} onBlur={() => handleBlur("password")}
              className={fieldClass("password")} />
            {touched.password && fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <PasswordInput placeholder="Confirm Password" value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)} onBlur={() => handleBlur("confirmPassword")}
              className={fieldClass("confirmPassword")} />
            {touched.confirmPassword && fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link href="/login" className="text-brand font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
