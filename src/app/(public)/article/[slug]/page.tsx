import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import ArticleView from "./ArticleView";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await serverApi.article(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.summary || stripHtml(article.content || "").slice(0, 160);
  const images = article.thumbnailUrl ? [{ url: article.thumbnailUrl }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await serverApi.article(slug);

  const jsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary || stripHtml(article.content || "").slice(0, 160),
    image: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? undefined,
    articleSection: article.category?.name,
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ArticleView />
    </>
  );
}
