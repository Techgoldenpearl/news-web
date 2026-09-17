"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { useBookmark } from "@/lib/useBookmark";
import { ShareButtons } from "@/components/ShareButtons";
import { CommentSection } from "@/components/CommentSection";
import { RelatedArticles, InlineRelatedCard } from "@/components/RelatedArticles";
import { LiveBlogTimeline } from "@/components/LiveBlogTimeline";
import { format } from "date-fns";
import { Clock, Eye, Lock } from "lucide-react";
import Link from "next/link";
import { InArticleAd } from "@/components/AdUnit";

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export default function ArticleView() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { bookmarked, toggle: toggleBookmark } = useBookmark(article?.id);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      publicApi.article(slug as string)
        .then((r) => setArticle(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-line border-t-brand mx-auto" /></div>;
  if (!article) return <div className="py-12 text-center"><h1 className="text-2xl font-bold">Article not found</h1><Link href="/home" className="text-brand mt-4 inline-block">Go to homepage</Link></div>;

  const title = isHindi ? (article.titleHindi || article.title) : article.title;
  const author = article.author;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] text-tx-3 pb-3.5">
        <Link href="/home" className="hover:text-brand">{isHindi ? "होम" : "Home"}</Link>
        {article.category && (
          <>
            <span className="text-line-2">›</span>
            <Link href={`/category/${article.category.slug}`} className="hover:text-brand">
              {isHindi ? (article.category.nameHindi || article.category.name) : article.category.name}
            </Link>
          </>
        )}
      </div>

      <article className="bg-panel border border-line rounded-lg p-4 sm:p-7">
        {article.category && (
          <span className="inline-block text-xs text-brand bg-brand-soft px-2.5 py-0.5 rounded">
            {isHindi ? (article.category.nameHindi || article.category.name) : article.category.name}
          </span>
        )}

        <h1 className="font-serif text-2xl sm:text-4xl font-normal leading-tight mt-3.5">{title}</h1>
        {isHindi && article.titleHindi && article.titleHindi !== article.title && (
          <p className="text-lg text-tx-3 mt-1.5">{article.title}</p>
        )}
        {article.summary && (
          <p className="text-lg text-tx-2 mt-3.5 leading-[1.7] max-w-[62ch]">{article.summary}</p>
        )}

        <div className="flex items-center gap-3.5 flex-wrap border-t border-b border-line mt-5.5 py-3.5 text-[13.5px] text-tx-3">
          {author && (
            <div className="flex items-center gap-2.5">
              <span className="relative w-9 h-9 rounded-full bg-panel-2 border border-line grid place-items-center text-sm text-tx-2 shrink-0 overflow-hidden">
                {author.avatarUrl ? <Image src={author.avatarUrl} alt={author.name} fill sizes="36px" className="object-cover" /> : (author.nameHindi || author.name)?.slice(0, 1)}
              </span>
              <div>
                <b className="block font-medium text-tx text-[14.5px] leading-tight">
                  {author.slug ? <Link href={`/author/${author.slug}`} className="hover:text-brand">{isHindi ? (author.nameHindi || author.name) : author.name}</Link> : (isHindi ? (author.nameHindi || author.name) : author.name)}
                </b>
              </div>
            </div>
          )}
          {article.publishedAt && <span className="font-mono">{format(new Date(article.publishedAt), "dd MMM yyyy, h:mm a")}</span>}
          <span className="flex items-center gap-1"><Clock size={14} />{article.readTimeMinutes || 3} {isHindi ? "मिनट" : "min"}</span>
          {article.viewsCount != null && <span className="flex items-center gap-1"><Eye size={14} />{article.viewsCount.toLocaleString()}</span>}
          {article.isBreaking && <span className="bg-live text-white text-xs px-2 py-0.5 rounded font-bold uppercase">{isHindi ? "ब्रेकिंग" : "Breaking"}</span>}
          {article.isPremium && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">PREMIUM</span>}
          <div className="ml-auto">
            <ShareButtons compact title={article.title} url={`/article/${article.slug}`} bookmarked={bookmarked} onToggleBookmark={toggleBookmark} />
          </div>
        </div>

        {article.videoType === "youtube" && article.videoUrl ? (
          <div className="mt-5.5 rounded-lg overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(article.videoUrl)}`}
              className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        ) : article.videoType === "direct" && article.videoUrl ? (
          <div className="mt-5.5 rounded-lg overflow-hidden">
            <video src={article.videoUrl} controls poster={article.thumbnailUrl} className="w-full max-h-[500px]" />
          </div>
        ) : article.thumbnailUrl && (
          <div className="mt-5.5">
            <div className="relative w-full aspect-[16/9] max-h-[500px] rounded-lg overflow-hidden bg-panel-2">
              <Image src={article.thumbnailUrl} alt={article.title} fill priority sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
            </div>
            {article.thumbnailCaption && <p className="text-[13px] text-tx-3 mt-2">{article.thumbnailCaption}</p>}
          </div>
        )}

        <InArticleAd position={1} />

        {article.id && <LiveBlogTimeline articleId={article.id} />}

        {article.isPremiumLocked ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center my-8">
            <Lock size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">{isHindi ? "प्रीमियम कंटेंट" : "Premium Content"}</h3>
            <p className="text-gray-600 mb-4">{isHindi ? "पूरी खबर पढ़ने के लिए सदस्यता लें।" : "Subscribe to read the full article and unlock all premium content."}</p>
            <Link href="/membership" className="inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition">
              {isHindi ? "प्लान देखें" : "View Plans"}
            </Link>
          </div>
        ) : (
          <>
            <div className="abody mt-6 max-w-[66ch] prose prose-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
            {article.categoryId && <InlineRelatedCard categoryId={article.categoryId} currentArticleId={article.id} />}
          </>
        )}

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-7">
            {article.tags.map((t: any) => (
              <Link key={t.id} href={`/topic/${t.slug}`}
                className="px-3.5 py-1.5 border border-line text-tx-2 text-[13.5px] rounded-full hover:border-brand hover:text-tx transition">
                #{isHindi ? (t.nameHindi || t.name) : t.name}
              </Link>
            ))}
          </div>
        )}

        {author && (
          <div className="flex gap-3.5 border border-line rounded-lg p-4 mt-6">
            <span className="relative w-13 h-13 rounded-full bg-panel-2 border border-line grid place-items-center text-xl text-tx-2 shrink-0 overflow-hidden">
              {author.avatarUrl ? <Image src={author.avatarUrl} alt={author.name} fill sizes="52px" className="object-cover" /> : (author.nameHindi || author.name)?.slice(0, 1)}
            </span>
            <div>
              <b className="text-base font-medium">{isHindi ? (author.nameHindi || author.name) : author.name}</b>
              {(author.bioHindi || author.bio) && (
                <p className="text-sm text-tx-2 mt-1 leading-[1.7]">{isHindi ? (author.bioHindi || author.bio) : author.bio}</p>
              )}
            </div>
          </div>
        )}

        <InArticleAd position={2} />

        {article.categoryId && (
          <RelatedArticles categoryId={article.categoryId} currentArticleId={article.id} />
        )}

        <CommentSection articleId={article.id} />
      </article>
    </div>
  );
}
