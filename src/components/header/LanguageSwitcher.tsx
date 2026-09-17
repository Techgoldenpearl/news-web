"use client";

import { useRef, useState } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { useOutsideClose } from "./useOutsideClose";

// Matches includedLanguages in the Google Translate init (src/app/layout.tsx).
// Only these actually translate the page — others would be decorative, so
// they're intentionally left out rather than offered as fake options.
const LANGS: { code: string; label: string }[] = [
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو" },
];

function setGoogleTranslateLanguage(code: string) {
  // The widget's own <select> is the only reliable way to trigger it
  // programmatically; dispatching a native change event is required
  // because Google's listener isn't a React-style onChange.
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (select) {
    select.value = code;
    select.dispatchEvent(new Event("change"));
    return;
  }
  // Widget not mounted yet (it loads after window "load") — fall back to
  // the cookie Google reads on init so the choice sticks after reload.
  document.cookie = `googtrans=/hi/${code};path=/`;
  window.location.reload();
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { isHindi } = useSite();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("hi");
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const pick = (code: string) => {
    setCurrent(code);
    setOpen(false);
    setGoogleTranslateLanguage(code);
  };

  const currentLabel = LANGS.find((l) => l.code === current)?.label || "हिंदी";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={isHindi ? "भाषा" : "Language"}
        className="flex items-center gap-2 border border-line rounded-full px-3 py-1.5 text-sm text-tx-2 hover:border-brand hover:text-tx transition"
      >
        <Languages size={15} />
        {!compact && <span>{currentLabel}</span>}
        <ChevronDown size={11} className="text-tx-3" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[min(84vw,270px)] max-h-[340px] overflow-y-auto bg-panel border border-line rounded-xl shadow-2xl z-[210] p-1.5">
          <div className="text-xs text-tx-3 px-3 pt-2 pb-1.5">{isHindi ? "भाषा चुनें" : "Choose language"}</div>
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              aria-pressed={current === l.code}
              className={`w-full flex items-center gap-2.5 text-right px-3 py-2.5 rounded-lg text-sm transition ${current === l.code ? "bg-panel-2" : "hover:bg-panel-2"}`}
            >
              <span className="flex-1 text-right">{l.label}</span>
              {current === l.code && <Check size={14} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
