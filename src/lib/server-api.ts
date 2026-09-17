import { headers } from "next/headers";

// Server-side fetches run inside the web container itself, so they must reach
// the api container over the Docker network (its Compose service name), not
// "localhost" — that only works when both run on the same host, e.g. local dev.
const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function serverFetch(path: string, params?: Record<string, string | number>) {
  try {
    // Forward the visitor's actual Host so the backend's siteResolver can
    // match it against sites.domain/subdomain — without this, SSR requests
    // all look identical regardless of which of the multi-tenant domains
    // the visitor is on, and the backend falls back to returning unfiltered
    // articles across every site.
    const incomingHeaders = await headers();
    const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");

    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    const res = await fetch(`${API_BASE}/api${path}${query}`, {
      headers: host ? { "X-Site-Domain": host } : undefined,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const serverApi = {
  site: () => serverFetch(`/sites/resolve`),
  // noCount=1: this call is only for generateMetadata/JSON-LD and runs on
  // every request including bots/crawlers — it must not count as a real
  // view. The client-side fetch in ArticleView is what counts real reads.
  article: (slug: string) => serverFetch(`/articles/${slug}`, { noCount: 1 }),
  articles: (params?: Record<string, string | number>) => serverFetch(`/articles`, params),
  categories: () => serverFetch(`/categories`),
  category: (slug: string) => serverFetch(`/categories/${slug}`),
  author: (slug: string) => serverFetch(`/features/authors/${slug}`),
  topic: (slug: string) => serverFetch(`/features/topics/${slug}`),
  state: (slug: string) => serverFetch(`/features/locations/states/${slug}/articles`),
  cityArticles: (stateSlug: string, citySlug: string) => serverFetch(`/features/locations/states/${stateSlug}/cities/${citySlug}/articles`),
  webStory: (slug: string) => serverFetch(`/features/web-stories/${slug}`),
  photoGallery: (slug: string) => serverFetch(`/features/photo-galleries/${slug}`),
};
