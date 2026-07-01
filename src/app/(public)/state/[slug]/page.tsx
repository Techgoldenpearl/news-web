import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import StateView from "./StateView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverApi.state(slug);

  if (!data?.state) return { title: "State not found" };

  const title = `${data.state.nameHindi || data.state.name} News`;
  const description = `Latest news and updates from ${data.state.name}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function StatePage() {
  return <StateView />;
}
