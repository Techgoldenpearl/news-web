"use client";

import Image from "next/image";
import { format } from "date-fns";
import { hi, enIN } from "date-fns/locale";
import { Share2 } from "lucide-react";
import { useSite } from "@/lib/site-context";

const TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  shok_sandesh: { en: "Shok Sandesh", hi: "शोक संदेश" },
  shradhanjali: { en: "Shradhanjali", hi: "श्रद्धांजलि" },
  punyatithi: { en: "Punyatithi", hi: "पुण्यतिथि" },
  uthavna: { en: "Uthavna", hi: "उठावना" },
  terahvi: { en: "Terahvi", hi: "तेरहवीं" },
  smriti_sandesh: { en: "Smriti Sandesh", hi: "स्मृति संदेश" },
};

interface ShokSandeshCardProps {
  item: any;
}

export function ShokSandeshCard({ item }: ShokSandeshCardProps) {
  const { isHindi } = useSite();
  const typeLabel = TYPE_LABELS[item.type];

  const share = () => {
    const text = `${isHindi ? "श्रद्धांजलि" : "Tribute"}: ${item.deceasedNameHindi || item.deceasedName}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`, "_blank");
    }
  };

  return (
    <div className="relative border border-line rounded-lg p-4.5 text-center bg-panel-2">
      <button onClick={share} aria-label="Share" className="absolute top-2.5 left-2.5 text-tx-3 hover:text-tx transition">
        <Share2 size={14} />
      </button>

      <div className="relative w-[88px] h-[100px] mx-auto mb-3 rounded-md border border-line bg-gradient-to-br from-[#e9e4dc] to-[#f4f1ec] overflow-hidden">
        {item.deceasedPhoto && <Image src={item.deceasedPhoto} alt={item.deceasedName} fill sizes="88px" className="object-cover" />}
      </div>

      {typeLabel && (
        <span className="inline-block text-[11.5px] text-brand bg-brand-soft px-2.5 py-0.5 rounded-full mb-1.5">
          {isHindi ? typeLabel.hi : typeLabel.en}
        </span>
      )}
      <h4 className="font-serif text-lg leading-[1.35]">{isHindi ? (item.deceasedNameHindi || item.deceasedName) : item.deceasedName}</h4>
      {item.deceasedAge && <div className="text-[13px] text-tx-3 mt-1">{isHindi ? `आयु ${item.deceasedAge} वर्ष` : `Age ${item.deceasedAge}`}</div>}

      <div className="text-[13.5px] text-tx-2 mt-2.5 leading-[1.6]">
        {item.dateOfDeath && <div>{format(new Date(item.dateOfDeath), "dd MMM yyyy", { locale: isHindi ? hi : enIN })}</div>}
        {(item.place || item.city) && <div>{[item.place, item.city, item.state].filter(Boolean).join(", ")}</div>}
      </div>

      {item.familyName && (
        <div className="text-[12.5px] text-tx-3 mt-2.5 pt-2.5 border-t border-line">
          {isHindi ? "परिवार" : "Family"}: {isHindi ? (item.familyNameHindi || item.familyName) : item.familyName}
        </div>
      )}

      {item.city && <span className="inline-block text-[11.5px] text-brand bg-brand-soft px-2.5 py-0.5 rounded mt-2.5">{item.city}</span>}
    </div>
  );
}
