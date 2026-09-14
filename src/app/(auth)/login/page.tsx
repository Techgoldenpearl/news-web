"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { loginSchema, fieldErrorsFrom } from "@/lib/auth-validation";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  const validate = (values: { email: string; password: string }) =>
    fieldErrorsFrom(loginSchema.safeParse(values));

  const handleBlur = (field: "email" | "password") => {
    setTouched((t) => ({ ...t, [field]: true }));
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
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Welcome Back</h1>
        <p className="text-gray-500 text-center mb-6">Sign in to your account</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email")}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand ${touched.email && fieldErrors.email ? "border-red-400" : ""}`} />
            {touched.email && fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <PasswordInput placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand ${touched.password && fieldErrors.password ? "border-red-400" : ""}`} />
            {touched.password && fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div className="text-right -mt-2">
            <Link href="/forgot-password" className="text-sm text-brand font-medium">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account? <Link href="/register" className="text-brand font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
