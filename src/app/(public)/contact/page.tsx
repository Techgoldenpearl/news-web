"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your message has been sent!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">संपर्क करें</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="text-brand mt-1" size={20} />
            <div><p className="font-medium">Email</p><p className="text-gray-600 text-sm">contact@thelocalleader.com</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="text-brand mt-1" size={20} />
            <div><p className="font-medium">Phone</p><p className="text-gray-600 text-sm">+91 XXX XXX XXXX</p></div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-brand mt-1" size={20} />
            <div><p className="font-medium">Address</p><p className="text-gray-600 text-sm">India</p></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" required className="w-full px-4 py-2.5 border rounded-lg" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your Email" required className="w-full px-4 py-2.5 border rounded-lg" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your Message" required rows={4} className="w-full px-4 py-2.5 border rounded-lg" />
          <button type="submit" className="bg-brand text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition">Send Message</button>
        </form>
      </div>
    </div>
  );
}
