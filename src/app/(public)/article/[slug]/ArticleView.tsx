"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { ShareButtons } from "@/components/ShareButtons";
import { CommentSection } from "@/components/CommentSection";
import { RelatedArticles } from "@/components/RelatedArticles";
import { format } from "date-fns";
import { Clock, Eye, Bookmark, BookmarkCheck, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InArticleAd } from "@/components/AdUnit";

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export default function ArticleView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isHindi } = useSite();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      publicApi.article(slug as string)
        .then((r) => setArticle(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (user && article) {
      customerApi.bookmarks()
        .then((r) => setBookmarked(r.data.some((b: any) => b.id === article.id)))
        .catch(() => {});
    }
  }, [user, article]);

  const toggleBookmark = async () => {
    if (!user) { toast.error("Please login to bookmark"); return; }
    try {
      if (bookmarked) {
        await customerApi.removeBookmark(article.id);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await customerApi.addBookmark(article.id);
        setBookmarked(true);
        toast.success("Bookmarked!");
      }
    } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-brand mx-auto" /></div>;
  if (!article) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><h1 className="text-2xl font-bold">Article not found</h1><Link href="/home" className="text-brand mt-4 inline-block">Go to homepage</Link></div>;

  return (
    <article className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        <span>/</span>
        {article.category && (
          <Link href={`/category/${article.category.slug}`} className="hover:text-brand">{isHindi ? (article.category.nameHindi || article.category.name) : article.category.name}</Link>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
        {isHindi ? (article.titleHindi || article.title) : article.title}
      </h1>
      {isHindi && article.titleHindi && article.titleHindi !== article.title && (
        <h2 className="text-xl text-gray-600 mb-3">{article.title}</h2>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
        {article.publishedAt && <span>{format(new Date(article.publishedAt), "dd MMM yyyy, h:mm a")}</span>}
        <span className="flex items-center gap-1"><Clock size={14} />{article.readTimeMinutes || 3} min</span>
        <span className="flex items-center gap-1"><Eye size={14} />{article.viewsCount?.toLocaleString()}</span>
        {article.isBreaking && <span className="bg-breaking text-white text-xs px-2 py-0.5 rounded font-bold uppercase animate-pulse">Breaking</span>}
        {article.isPremium && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">PREMIUM</span>}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleBookmark} className={`p-2 rounded-lg transition ${bookmarked ? "bg-brand-tint text-brand" : "hover:bg-gray-100 text-gray-400"}`}>
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      {article.videoType === "youtube" && article.videoUrl ? (
        <div className="mb-6 rounded-xl overflow-hidden aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(article.videoUrl)}`}
            className="w-full h-full" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      ) : article.videoType === "direct" && article.videoUrl ? (
        <div className="mb-6 rounded-xl overflow-hidden">
          <video src={article.videoUrl} controls poster={article.thumbnailUrl} className="w-full max-h-[500px]" />
        </div>
      ) : article.thumbnailUrl && (
        <div className="mb-6 rounded-xl overflow-hidden"><img src={article.thumbnailUrl} alt={article.title} className="w-full object-cover max-h-[500px]" /></div>
      )}

      {article.summary && (
        <p className="text-lg text-gray-700 font-medium mb-6 border-l-4 border-brand pl-4 bg-brand-tint py-3 rounded-r-lg">{article.summary}</p>
      )}

      <InArticleAd position={1} />

      {article.isPremiumLocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center my-8">
          <Lock size={40} className="text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Premium Content</h3>
          <p className="text-gray-600 mb-4">Subscribe to read the full article and unlock all premium content.</p>
          <Link href="/membership" className="inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition">
            View Plans
          </Link>
        </div>
      ) : (
        <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: article.content }} />
      )}

      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((t: any) => (
            <Link key={t.id} href={`/topic/${t.slug}`}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition">
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between py-4 border-t border-b">
        <ShareButtons title={article.title} url={`/article/${article.slug}`} />
      </div>

      <InArticleAd position={2} />

      {article.categoryId && (
        <RelatedArticles categoryId={article.categoryId} currentArticleId={article.id} />
      )}

      <CommentSection articleId={article.id} />
    </article>
  );
}
