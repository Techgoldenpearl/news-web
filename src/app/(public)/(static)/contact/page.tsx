"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/lib/site-context";

export default function ContactPage() {
  const { site, isHindi } = useSite();
  const siteName = site?.name || "NewsHub";
  const domain = site?.domain?.replace(/\.localhost$/, ".com") || "example.com";
  const contactEmail = `contact@${domain}`;

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isHindi ? "आपका संदेश भेज दिया गया है!" : "Your message has been sent!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "संपर्क करें" : "Contact Us"}</h1>
      <p className="text-gray-600 mb-8">
        {isHindi ? `${siteName} से जुड़ने के लिए नीचे दी गई जानकारी का उपयोग करें, या हमें सीधे संदेश भेजें।` : `Get in touch with ${siteName} using the details below, or send us a message directly.`}
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="text-brand mt-1" size={20} />
            <div><p className="font-medium">{isHindi ? "ईमेल" : "Email"}</p><p className="text-gray-600 text-sm">{contactEmail}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="text-brand mt-1" size={20} />
            <div><p className="font-medium">{isHindi ? "फ़ोन" : "Phone"}</p><p className="text-gray-600 text-sm">+91 XXX XXX XXXX</p></div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-brand mt-1" size={20} />
            <div><p className="font-medium">{isHindi ? "पता" : "Address"}</p><p className="text-gray-600 text-sm">{site?.region ? `${site.region}, India` : "India"}</p></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isHindi ? "आपका नाम" : "Your Name"} required className="w-full px-4 py-2.5 border rounded-lg" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={isHindi ? "आपका ईमेल" : "Your Email"} required className="w-full px-4 py-2.5 border rounded-lg" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={isHindi ? "आपका संदेश" : "Your Message"} required rows={4} className="w-full px-4 py-2.5 border rounded-lg" />
          <button type="submit" className="bg-brand text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition">{isHindi ? "संदेश भेजें" : "Send Message"}</button>
        </form>
      </div>
    </div>
  );
}
