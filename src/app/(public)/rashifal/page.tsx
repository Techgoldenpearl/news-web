"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { RASHI_LIST } from "@/lib/constants";

function RashifalContent() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Auto-select from URL param (e.g. /rashifal?rashi=mesh)
  useEffect(() => {
    const param = searchParams.get("rashi");
    if (param && RASHI_LIST.some((r) => r.slug === param)) {
      setSelected(param);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selected) {
      publicApi.rashifal(selected).then((r) => setData(r.data)).catch(() => {});
    }
  }, [selected]);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">आज का राशिफल</h1>
      <p className="text-tx-3 mb-6">अपनी राशि चुनें और आज का भविष्यफल देखें</p>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {RASHI_LIST.map((r) => (
          <button key={r.slug} onClick={() => setSelected(r.slug)}
            className={`p-4 rounded-xl border text-center transition ${
              selected === r.slug ? "bg-brand text-white border-brand" : "bg-panel border-line hover:border-brand/40"
            }`}>
            <span className="text-3xl block mb-1">{r.symbol}</span>
            <span className="text-sm font-medium">{r.nameHindi}</span>
          </button>
        ))}
      </div>

      {data && (
        <div className="bg-panel rounded-lg border-line border p-6">
          <h2 className="text-2xl font-bold mb-4">
            {RASHI_LIST.find((r) => r.slug === selected)?.symbol} {RASHI_LIST.find((r) => r.slug === selected)?.nameHindi}
          </h2>
          <p className="text-tx-2 leading-relaxed mb-4">{data.contentHindi || data.content}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-panel-2 p-3 rounded-lg text-center"><p className="text-sm text-tx-3">Lucky Number</p><p className="font-bold">{data.luckyNumber ?? "—"}</p></div>
            <div className="bg-panel-2 p-3 rounded-lg text-center"><p className="text-sm text-tx-3">Lucky Color</p><p className="font-bold">{data.luckyColor ?? "—"}</p></div>
            <div className="bg-panel-2 p-3 rounded-lg text-center"><p className="text-sm text-tx-3">Score</p><p className="font-bold">{data.score != null ? `${data.score}/10` : "—"}</p></div>
            <div className="bg-panel-2 p-3 rounded-lg text-center"><p className="text-sm text-tx-3">Love</p><p className="font-bold">{data.loveScore != null ? `${data.loveScore}/10` : "—"}</p></div>
          </div>
        </div>
      )}
      {!data && !selected && (
        <p className="text-center text-tx-3 py-8">अपनी राशि चुनें / Select your zodiac sign</p>
      )}
    </div>
  );
}

export default function RashifalPage() {
  return <Suspense><RashifalContent /></Suspense>;
}
