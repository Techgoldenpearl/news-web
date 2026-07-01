import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import AuthorView from "./AuthorView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverApi.author(slug);

  if (!data?.author) return { title: "Author not found" };

  const { author } = data;
  const title = author.nameHindi || author.name;
  const description = author.bio || `Articles by ${author.name}${author.designation ? ` — ${author.designation}` : ""}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile", images: author.photoUrl ? [{ url: author.photoUrl }] : undefined },
  };
}

export default function AuthorPage() {
  return <AuthorView />;
}
