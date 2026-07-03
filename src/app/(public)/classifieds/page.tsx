"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Search, MapPin, Phone, MessageCircle, AlertTriangle, Star, Zap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { hi, enIN } from "date-fns/locale";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "", label: "All", labelHi: "सभी" },
  { value: "property", label: "Property", labelHi: "संपत्ति" },
  { value: "jobs", label: "Jobs", labelHi: "नौकरी" },
  { value: "business", label: "Business", labelHi: "व्यापार" },
  { value: "services", label: "Services", labelHi: "सेवाएं" },
  { value: "vehicles", label: "Vehicles", labelHi: "वाहन" },
  { value: "buy_sell", label: "Buy/Sell", labelHi: "खरीदें/बेचें" },
  { value: "matrimonial", label: "Matrimonial", labelHi: "वैवाहिक" },
  { value: "education", label: "Education", labelHi: "शिक्षा" },
  { value: "lost_found", label: "Lost & Found", labelHi: "खोया-पाया" },
  { value: "public_notice", label: "Public Notice", labelHi: "सार्वजनिक सूचना" },
];

export default function ClassifiedsPage() {
  const { isHindi } = useSite();
  const [ads, setAds] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedAd, setSelectedAd] = useState<any>(null);

  const loadAds = () => {
    publicApi.classifieds({ page, limit: 12, category: category || undefined, search: search || undefined })
      .then((r) => { setAds(r.data.items); setTotal(r.data.total); }).catch(() => {});
  };

  useEffect(() => { loadAds(); }, [page, category]);

  const handleReport = async (adId: number) => {
    const reason = prompt(isHindi ? "रिपोर्ट का कारण:" : "Report reason:");
    if (!reason) return;
    try {
      await publicApi.reportClassified(adId, reason);
      toast.success(isHindi ? "रिपोर्ट दर्ज की गई" : "Ad reported");
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{isHindi ? "वर्गीकृत विज्ञापन" : "Classifieds"}</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => { setCategory(c.value); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === c.value ? "bg-brand text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {isHindi ? c.labelHi : c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 max-w-md mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadAds()}
            placeholder={isHindi ? "विज्ञापन खोजें..." : "Search classifieds..."} className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm" />
        </div>
        <button onClick={loadAds} className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm hover:opacity-90 transition">
          {isHindi ? "खोजें" : "Search"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl border hover:shadow-md transition p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded capitalize">
                {isHindi ? (CATEGORIES.find((c) => c.value === ad.category)?.labelHi || ad.category) : (CATEGORIES.find((c) => c.value === ad.category)?.label || ad.category)}
              </span>
              <div className="flex gap-1">
                {ad.isFeatured && <Star size={14} className="text-yellow-500" />}
                {ad.isUrgent && <Zap size={14} className="text-red-500" />}
              </div>
            </div>
            {ad.images?.length > 0 && (
              <img src={ad.images[0]} alt={ad.title} className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{isHindi ? (ad.titleHindi || ad.title) : ad.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{isHindi ? (ad.descriptionHindi || ad.description) : ad.description}</p>
            {ad.price && <p className="text-lg font-bold text-brand mb-2">{ad.price}</p>}
            {ad.city && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mb-3"><MapPin size={12} /> {ad.city}{ad.state ? `, ${ad.state}` : ""}</p>
            )}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex gap-2">
                {ad.contactPhone && (
                  <a href={`tel:${ad.contactPhone}`} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg">
                    <Phone size={12} /> {isHindi ? "कॉल" : "Call"}
                  </a>
                )}
                {ad.contactWhatsapp && (
                  <a href={`https://wa.me/${ad.contactWhatsapp}`} target="_blank" className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg">
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}
              </div>
              <button onClick={() => handleReport(ad.id)} className="text-gray-400 hover:text-red-500 p-1" title="Report">
                <AlertTriangle size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-2">{format(new Date(ad.createdAt), "dd MMM yyyy", { locale: isHindi ? hi : enIN })}</p>
          </div>
        ))}
      </div>

      {ads.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "कोई विज्ञापन नहीं मिला" : "No classifieds found"}</p>}

      {Math.ceil(total / 12) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-40">{isHindi ? "पिछला" : "Previous"}</button>
          <span className="text-sm text-gray-500">{page} / {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 12)} className="px-4 py-2 border rounded-lg disabled:opacity-40">{isHindi ? "अगला" : "Next"}</button>
        </div>
      )}
    </div>
  );
}
