"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Search, MapPin, Calendar, Share2, Heart } from "lucide-react";
import { format } from "date-fns";
import { hi, enIN } from "date-fns/locale";

const TYPES = [
  { value: "", label: "All", labelHi: "सभी" },
  { value: "shok_sandesh", label: "Shok Sandesh", labelHi: "शोक संदेश" },
  { value: "shradhanjali", label: "Shradhanjali", labelHi: "श्रद्धांजलि" },
  { value: "punyatithi", label: "Punyatithi", labelHi: "पुण्यतिथि" },
  { value: "uthavna", label: "Uthavna", labelHi: "उठावना" },
  { value: "terahvi", label: "Terahvi", labelHi: "तेरहवीं" },
  { value: "smriti_sandesh", label: "Smriti Sandesh", labelHi: "स्मृति संदेश" },
];

export default function ShokSandeshPage() {
  const { isHindi } = useSite();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  const loadItems = () => {
    publicApi.shokSandesh({ page, limit: 12, type: type || undefined, search: search || undefined })
      .then((r) => { setItems(r.data.items); setTotal(r.data.total); }).catch(() => {});
  };

  useEffect(() => { loadItems(); }, [page, type]);

  const share = (item: any) => {
    const text = `${isHindi ? "श्रद्धांजलि" : "Tribute"}: ${item.deceasedNameHindi || item.deceasedName}`;
    if (navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <Heart size={32} className="text-gray-400 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">{isHindi ? "शोक संदेश / श्रद्धांजलि" : "Obituaries & Tributes"}</h1>
        <p className="text-gray-500 mt-1 text-sm">{isHindi ? "अपनों को श्रद्धांजलि अर्पित करें" : "Pay tribute to your loved ones"}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => { setType(t.value); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm transition ${type === t.value ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {isHindi ? t.labelHi : t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 max-w-md mx-auto mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadItems()}
            placeholder={isHindi ? "नाम से खोजें..." : "Search by name..."} className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm" />
        </div>
        <button onClick={loadItems} className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm hover:opacity-90 transition">
          {isHindi ? "खोजें" : "Search"}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
            <div className="flex gap-5">
              {item.deceasedPhoto && (
                <img src={item.deceasedPhoto} alt={item.deceasedName}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded mb-2 inline-block">
                      {TYPES.find((t) => t.value === item.type)?.[isHindi ? "labelHi" : "label"] || item.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{isHindi ? (item.deceasedNameHindi || item.deceasedName) : item.deceasedName}</h3>
                    {item.deceasedAge && <p className="text-sm text-gray-500">{isHindi ? `आयु: ${item.deceasedAge} वर्ष` : `Age: ${item.deceasedAge} years`}</p>}
                  </div>
                  <button onClick={() => share(item)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Share2 size={16} />
                  </button>
                </div>

                {item.familyName && (
                  <p className="text-sm text-gray-600 mt-1">
                    {isHindi ? "परिवार:" : "Family:"} {isHindi ? (item.familyNameHindi || item.familyName) : item.familyName}
                  </p>
                )}

                {item.dateOfDeath && (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Calendar size={12} /> {format(new Date(item.dateOfDeath), "dd MMMM yyyy", { locale: isHindi ? hi : enIN })}
                  </p>
                )}

                {(item.place || item.city) && (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin size={12} /> {[item.place, item.city, item.state].filter(Boolean).join(", ")}
                  </p>
                )}

                {item.message && (
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed border-l-2 border-gray-300 pl-3 italic">
                    {isHindi ? (item.messageHindi || item.message) : item.message}
                  </p>
                )}

                {item.eventDetails && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{isHindi ? "कार्यक्रम विवरण:" : "Event Details:"}</p>
                    <p className="text-sm text-gray-600">{isHindi ? (item.eventDetailsHindi || item.eventDetails) : item.eventDetails}</p>
                    {item.eventDate && <p className="text-xs text-gray-400 mt-1">{format(new Date(item.eventDate), "dd MMM yyyy", { locale: isHindi ? hi : enIN })} {item.eventPlace ? `· ${item.eventPlace}` : ""}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई प्रविष्टि नहीं मिली" : "No entries found"}</p>
      )}

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
