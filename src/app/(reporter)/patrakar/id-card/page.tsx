"use client";

import { useEffect, useState } from "react";
import { ReporterGate } from "@/components/reporter/ReporterGate";
import { reporterMiscApi } from "@/lib/reporter-api";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

function IdCardContent() {
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    reporterMiscApi.idCard().then((r) => setCard(r.data)).catch(() => {});
  }, []);

  if (!card) return null;

  const expired = card.idCardExpiry && new Date(card.idCardExpiry) < new Date();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">पत्रकार पहचान पत्र</h1>

      <div className="bg-white rounded-2xl border-2 border-brand shadow-lg overflow-hidden">
        <div className="bg-brand text-white text-center py-3">
          <p className="font-bold text-sm tracking-wide">PRESS / पत्रकार पहचान पत्र</p>
        </div>
        <div className="p-6 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-tint border-2 border-brand/30 mx-auto mb-4 flex items-center justify-center">
            {card.photoUrl ? (
              <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-brand">{(card.nameHindi || card.name)?.charAt(0)}</span>
            )}
          </div>
          <h2 className="text-xl font-bold">{card.nameHindi || card.name}</h2>
          <p className="text-brand font-medium text-sm">{card.designation}</p>

          <div className="text-left mt-5 space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-gray-500">Employee ID</span><span className="font-mono font-medium">{card.employeeId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">बीट</span><span className="font-medium">{card.beat || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">शहर</span><span className="font-medium">{card.city || "—"}, {card.state || ""}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">वैधता</span>
              <span className={`font-medium ${expired ? "text-red-600" : "text-green-600"}`}>
                {card.idCardExpiry ? format(new Date(card.idCardExpiry), "dd MMM yyyy", { locale: hi }) : "—"} {expired && "(समाप्त)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">यह डिजिटल पहचान पत्र केवल पहचान सत्यापन हेतु है</p>
    </div>
  );
}

export default function IdCardPage() {
  return (
    <ReporterGate>
      <IdCardContent />
    </ReporterGate>
  );
}
