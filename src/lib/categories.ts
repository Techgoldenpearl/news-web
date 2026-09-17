import type { Category } from "@/types";

/**
 * The categories endpoint can return the same logical category more than
 * once — e.g. a shared "Politics"/"politics" row belonging to another
 * site's tenant alongside this site's own "राजनीति" — because the
 * backend's site-scoping rule (categoryMatchesSite) matches more broadly
 * than "belongs to this site" (it also pulls in siteId-null/shared rows
 * and cross-site overrides). De-dupe by slug (case-insensitive), so the
 * same category never renders twice under two names/cases, preferring
 * the row that actually belongs to the current site, then the one with
 * a Hindi name filled in.
 */
export function dedupeCategories(raw: Category[], currentSiteId?: number): Category[] {
  const bySlug = new Map<string, Category>();
  for (const c of raw) {
    const key = c.slug.toLowerCase();
    const existing = bySlug.get(key);
    if (!existing) { bySlug.set(key, c); continue; }
    const existingMatchesSite = existing.siteId === currentSiteId;
    const candidateMatchesSite = c.siteId === currentSiteId;
    if (candidateMatchesSite && !existingMatchesSite) bySlug.set(key, c);
    else if (!existing.nameHindi && c.nameHindi) bySlug.set(key, c);
  }
  return Array.from(bySlug.values());
}
