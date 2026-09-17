import { formatDistanceToNowStrict } from "date-fns";
import { hi } from "date-fns/locale";

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

/**
 * date-fns's hi locale renders numerals in Devanagari (२१ घंटे पहले)
 * instead of Western digits — but this design's numeral convention (dates,
 * counts, prices) is Western digits everywhere, Hindi UI text included
 * (the mockup's `.num` / font-mono treatment). Convert them back rather
 * than dropping the hi locale, so "पहले"/"मिनट"/etc. wording stays correct.
 */
function toWesternDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

export function formatRelativeTime(date: Date | string | number, isHindi: boolean): string {
  const formatted = formatDistanceToNowStrict(new Date(date), {
    locale: isHindi ? hi : undefined,
    addSuffix: true,
  });
  return isHindi ? toWesternDigits(formatted) : formatted;
}
