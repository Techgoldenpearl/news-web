"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
import { AdSlot } from "@/components/AdSlot";
import { Hash, Users } from "lucide-react";
import { toast } from "sonner";

export default function TopicView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isHindi } = useSite();
  const [data, setData] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (slug) publicApi.topic(slug as string).then((r) => {
      setData(r.data);
      setFollowersCount(r.data.topic.followersCount || 0);
    });
  }, [slug]);

  const toggleFollow = async () => {
    if (!user) { toast.error(isHindi ? "फॉलो करने के लिए लॉगिन करें" : "Please login to follow"); return; }
    try {
      const res = await customerApi.followTopic(data.topic.id);
      setFollowing(res.data.following);
      setFollowersCount((c: number) => c + (res.data.following ? 1 : -1));
    } catch { toast.error("Failed"); }
  };

  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl border p-5 mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-1.5"><Hash size={22} className="text-brand" />{data.topic.nameHindi || data.topic.name}</h1>
          {data.topic.description && <p className="text-gray-500 mt-1">{data.topic.description}</p>}
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-2">
            <Users size={12} /> {followersCount} {isHindi ? "फॉलोअर्स" : "followers"} · {data.articles.length} {isHindi ? "लेख" : "articles"}
          </span>
        </div>
        <button onClick={toggleFollow}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition shrink-0 ${following ? "bg-brand-tint text-brand" : "bg-brand text-white hover:opacity-90"}`}>
          {following ? (isHindi ? "फॉलो किया गया" : "Following") : (isHindi ? "फॉलो करें" : "Follow")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.articles.map((a: any, i: number) => (
              <Fragment key={a.id}>
                <NewsCard {...a} />
                {(i + 1) % 6 === 0 && (
                  <div className="md:col-span-2">
                    <AdSlot zone="category-top" className="w-full max-w-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {data.articles.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "इस टॉपिक में कोई लेख नहीं" : "No articles in this topic"}</p>}
        </div>

        <aside className="space-y-4">
          <AdSlot zone="sidebar-top" className="w-full" />
          <AdSlot zone="sidebar-middle" className="w-full" />
        </aside>
      </div>
    </div>
  );
}
