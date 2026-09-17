import type { RashifalSign } from "@/types";

// Static zodiac-sign reference data — not "content," so unlike news/API
// data it's fine to keep as a fixed client-side list. Previously duplicated
// across RashifalStrip.tsx and the /rashifal page; centralized here.
export const RASHI_LIST: RashifalSign[] = [
  { slug: "mesh", name: "Aries", nameHindi: "मेष", symbol: "♈" },
  { slug: "vrishabh", name: "Taurus", nameHindi: "वृषभ", symbol: "♉" },
  { slug: "mithun", name: "Gemini", nameHindi: "मिथुन", symbol: "♊" },
  { slug: "kark", name: "Cancer", nameHindi: "कर्क", symbol: "♋" },
  { slug: "singh", name: "Leo", nameHindi: "सिंह", symbol: "♌" },
  { slug: "kanya", name: "Virgo", nameHindi: "कन्या", symbol: "♍" },
  { slug: "tula", name: "Libra", nameHindi: "तुला", symbol: "♎" },
  { slug: "vrishchik", name: "Scorpio", nameHindi: "वृश्चिक", symbol: "♏" },
  { slug: "dhanu", name: "Sagittarius", nameHindi: "धनु", symbol: "♐" },
  { slug: "makar", name: "Capricorn", nameHindi: "मकर", symbol: "♑" },
  { slug: "kumbh", name: "Aquarius", nameHindi: "कुंभ", symbol: "♒" },
  { slug: "meen", name: "Pisces", nameHindi: "मीन", symbol: "♓" },
];
