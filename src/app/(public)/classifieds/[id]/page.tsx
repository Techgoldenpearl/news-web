"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { ArrowLeft, MapPin, Phone, MessageCircle, AlertTriangle, Star, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { hi, enIN } from "date-fns/locale";
import { toast } from "sonner";

const CATEGORIES = [
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

export default function ClassifiedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isHindi } = useSite();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const id = Number(params?.id);

  useEffect(() => {
    if (!id || isNaN(id)) { setNotFound(true); setLoading(false); return; }
    publicApi.classifiedDetail(id)
      .then((r) => setAd(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReport = async () => {
    const reason = prompt(isHindi ? "रिपोर्ट का कारण:" : "Report reason:");
    if (!reason) return;
    try {
      await publicApi.reportClassified(ad.id, reason);
      toast.success(isHindi ? "रिपोर्ट दर्ज की गई" : "Ad reported");
    } catch { toast.error("Failed"); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-line border-t-brand" />
      </div>
    );
  }

  if (notFound || !ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-tx-3 mb-4">{isHindi ? "यह विज्ञापन उपलब्ध नहीं है" : "This ad is not available"}</p>
        <Link href="/classifieds" className="text-brand hover:underline">{isHindi ? "← सभी विज्ञापन देखें" : "← Back to Classifieds"}</Link>
      </div>
    );
  }

  const images: string[] = ad.images || [];
  const categoryLabel = isHindi
    ? (CATEGORIES.find((c) => c.value === ad.category)?.labelHi || ad.category)
    : (CATEGORIES.find((c) => c.value === ad.category)?.label || ad.category);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => router.push("/classifieds")} className="flex items-center gap-1.5 text-tx-3 hover:text-brand text-sm mb-4">
        <ArrowLeft size={16} /> {isHindi ? "सभी विज्ञापन" : "All Classifieds"}
      </button>

      <div className="bg-panel rounded-lg border-line border p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded capitalize">{categoryLabel}</span>
          <div className="flex gap-1.5">
            {ad.isFeatured && <Star size={16} className="text-yellow-500" />}
            {ad.isUrgent && <Zap size={16} className="text-red-500" />}
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-4">
            <div className="relative w-full h-72 sm:h-96 rounded-lg overflow-hidden bg-panel-2">
              <Image src={images[activeIndex]} alt={ad.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-contain" priority />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                    aria-label={isHindi ? "पिछली फ़ोटो" : "Previous photo"}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                    aria-label={isHindi ? "अगली फ़ोटो" : "Next photo"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/65 text-white text-xs px-2 py-0.5 rounded-md">
                    {activeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition ${i === activeIndex ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <h1 className="text-xl font-bold text-tx mb-1">{isHindi ? (ad.titleHindi || ad.title) : ad.title}</h1>
        {ad.price && <p className="text-2xl font-bold text-brand mb-3">{ad.price}</p>}

        {(ad.description || ad.descriptionHindi) && (
          <p className="text-sm text-tx-2 whitespace-pre-wrap mb-4">{isHindi ? (ad.descriptionHindi || ad.description) : ad.description}</p>
        )}

        {(ad.city || ad.area) && (
          <p className="flex items-center gap-1.5 text-sm text-tx-3 mb-4">
            <MapPin size={14} /> {[ad.area, ad.city, ad.state].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            {ad.contactPhone && (
              <a href={`tel:${ad.contactPhone}`} className="flex items-center gap-1.5 text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition">
                <Phone size={14} /> {isHindi ? "कॉल करें" : "Call"}
              </a>
            )}
            {ad.contactWhatsapp && (
              <a href={`https://wa.me/${ad.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
          </div>
          <button onClick={handleReport} className="flex items-center gap-1 text-tx-3 hover:text-red-500 text-xs" title={isHindi ? "रिपोर्ट करें" : "Report"}>
            <AlertTriangle size={14} /> {isHindi ? "रिपोर्ट करें" : "Report"}
          </button>
        </div>

        <p className="text-xs text-tx-3 mt-3">
          {format(new Date(ad.createdAt), "dd MMM yyyy", { locale: isHindi ? hi : enIN })}
        </p>
      </div>
    </div>
  );
}
