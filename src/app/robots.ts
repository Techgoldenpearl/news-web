import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Reporter/advertiser portals and auth flows have no reason to be
      // indexed — they're login-gated tools, not content for search results.
      disallow: ["/patrakar", "/advertiser", "/login", "/register", "/forgot-password", "/profile", "/bookmarks", "/history"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
