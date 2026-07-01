import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import CategoryView from "./CategoryView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await serverApi.category(slug);

  if (!category) return { title: "Category not found" };

  const title = `${category.nameHindi || category.name} News`;
  const description = category.description || `Latest ${category.name} news and updates.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function CategoryPage() {
  return <CategoryView />;
}
