"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { User, Bookmark, Clock, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: "", bio: "" });
  }, [user]);
  const [saving, setSaving] = useState(false);

  if (!loading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <User size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-500 mb-4">Login to manage your profile</p>
        <Link href="/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">Login</Link>
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-brand-tint rounded-full flex items-center justify-center text-3xl font-bold text-brand">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-brand" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91..." className="w-full px-4 py-2.5 border rounded-xl" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3} className="w-full px-4 py-2.5 border rounded-xl" /></div>
          <button type="submit" disabled={saving}
            className="bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/bookmarks" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md transition">
          <div className="p-2.5 bg-blue-100 rounded-lg"><Bookmark size={18} className="text-blue-600" /></div>
          <span className="font-medium">Bookmarks</span>
        </Link>
        <Link href="/history" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md transition">
          <div className="p-2.5 bg-purple-100 rounded-lg"><Clock size={18} className="text-purple-600" /></div>
          <span className="font-medium">History</span>
        </Link>
        <Link href="/membership" className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md transition">
          <div className="p-2.5 bg-amber-100 rounded-lg"><CreditCard size={18} className="text-amber-600" /></div>
          <span className="font-medium">Membership</span>
        </Link>
      </div>

      <button onClick={logout}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
