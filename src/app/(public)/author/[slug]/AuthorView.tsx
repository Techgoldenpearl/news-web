"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { Mail, FileText } from "lucide-react";

export default function AuthorView() {
  const { slug } = useParams();
  const { isHindi } = useSite();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (slug) publicApi.author(slug as string).then((r) => setData(r.data));
  }, [slug]);

  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  const author = data.author;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl border p-5 mb-6 flex items-start gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-tint border-2 border-brand/30 shrink-0 flex items-center justify-center">
          {author.photoUrl ? (
            <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-brand">{(author.nameHindi || author.name)?.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{author.nameHindi || author.name}</h1>
          {author.designation && <p className="text-brand font-medium text-sm mt-0.5">{author.designation}</p>}
          {author.bio && <p className="text-sm text-gray-600 mt-2">{author.bio}</p>}
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              <FileText size={12} /> {author.articlesCount ?? data.articles.length} {isHindi ? "लेख" : "articles"}
            </span>
            {author.email && (
              <a href={`mailto:${author.email}`} className="text-gray-400 hover:text-brand transition"><Mail size={16} /></a>
            )}
            {author.twitterHandle && (
              <a href={`https://twitter.com/${author.twitterHandle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition" title="Twitter/X">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {author.facebookUrl && (
              <a href={author.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition" title="Facebook">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.articles.map((a: any) => <NewsCard key={a.id} {...a} />)}
      </div>
      {data.articles.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "कोई लेख उपलब्ध नहीं" : "No articles yet"}</p>}
    </div>
  );
}
