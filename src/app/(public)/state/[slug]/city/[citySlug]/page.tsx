import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import CityView from "./CityView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; citySlug: string }> }): Promise<Metadata> {
  const { slug, citySlug } = await params;
  const data = await serverApi.cityArticles(slug, citySlug);

  if (!data?.city) return { title: "City not found" };

  const title = `${data.city.nameHindi || data.city.name} News`;
  const description = `Latest news and updates from ${data.city.name}, ${data.state.name}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function CityPage() {
  return <CityView />;
}
