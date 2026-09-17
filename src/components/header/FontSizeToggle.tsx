"use client";

import { useUI } from "@/lib/ui-context";
import { useSite } from "@/lib/site-context";

export function FontSizeToggle() {
  const { fontSize, toggleFontSize } = useUI();
  const { isHindi } = useSite();

  return (
    <button
      onClick={toggleFontSize}
      aria-pressed={fontSize === "large"}
      aria-label={isHindi ? "अक्षर का आकार" : "Font size"}
      className={`flex items-baseline gap-0.5 border rounded-full px-3 py-1.5 transition ${
        fontSize === "large" ? "border-brand text-brand bg-brand-soft" : "border-line text-tx-2 hover:border-brand hover:text-tx"
      }`}
    >
      <span className="text-[17px] leading-none">अ</span>
      <span className="text-xs leading-none">अ</span>
    </button>
  );
}
