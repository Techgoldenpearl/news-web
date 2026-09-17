import type { MetadataRoute } from "next";
import { serverApi } from "@/lib/server-api";

// Dynamic per-tenant manifest — this app serves 7+ news brands from one
// deployment, so a single static manifest.json can only ever be correct for
// one of them. Resolves the current site the same way generateMetadata()
// in layout.tsx does, and points icons at that site's own logo instead of
// non-existent generated PNG sizes.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await serverApi.site();

  const name = site?.name ? `${site.name} - Hindi News Portal` : "NewsHub - Hindi News";
  const shortName = site?.name || "NewsHub";
  const themeColor = site?.primaryColor || "#E53E3E";
  const icon = site?.logoUrl;

  return {
    name,
    short_name: shortName,
    description: site?.description || "Latest Hindi news, breaking news, politics, sports, entertainment, rashifal and more",
    start_url: "/home",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    orientation: "portrait-primary",
    lang: site?.language || "hi",
    categories: ["news", "entertainment", "sports"],
    icons: icon
      ? [
          { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
        ]
      : [],
  };
}
