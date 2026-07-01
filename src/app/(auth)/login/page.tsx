"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand" />
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
