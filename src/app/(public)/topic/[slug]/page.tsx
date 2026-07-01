import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import TopicView from "./TopicView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverApi.topic(slug);

  if (!data?.topic) return { title: "Topic not found" };

  const title = `#${data.topic.nameHindi || data.topic.name}`;
  const description = data.topic.description || `Latest articles about ${data.topic.name}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function TopicPage() {
  return <TopicView />;
}
