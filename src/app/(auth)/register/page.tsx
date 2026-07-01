"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
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
      await register(form);
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.map((d: any) => d.message).join(", ") || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Create Account</h1>
        <p className="text-gray-500 text-center mb-6">Join our news platform</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="w-full px-4 py-3 border rounded-xl" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="w-full px-4 py-3 border rounded-xl" />
          <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl" />
          <input type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8}
            className="w-full px-4 py-3 border rounded-xl" />
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
