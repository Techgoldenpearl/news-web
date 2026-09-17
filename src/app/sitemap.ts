import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { serverApi } from "@/lib/server-api";

// Per-tenant sitemap: this app serves 7+ domains from one deployment, and
// serverApi forwards the visitor's Host header to the backend's siteResolver
// (see server-api.ts), so this naturally comes back scoped to whichever
// domain requested /sitemap.xml.
const MAX_ARTICLES = 2000; // ~20 backend pages at the API's max page size of 100
const PAGE_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/home`, changeFrequency: "always", priority: 1 },
    { url: `${baseUrl}/latest`, changeFrequency: "always", priority: 0.9 },
    { url: `${baseUrl}/search`, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/epaper`, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/shok-sandesh`, changeFrequency: "daily", priority: 0.4 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categories = (await serverApi.categories()) || [];
  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c: any) => c.showInNav !== false)
    .map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));

  const articleEntries: MetadataRoute.Sitemap = [];
  for (let page = 1; articleEntries.length < MAX_ARTICLES; page++) {
    const result = await serverApi.articles({ page, limit: PAGE_SIZE });
    const items = result?.items || [];
    if (items.length === 0) break;

    for (const a of items) {
      articleEntries.push({
        url: `${baseUrl}/article/${a.slug}`,
        lastModified: a.updatedAt || a.publishedAt || undefined,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    if (!result?.hasMore) break;
  }

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
