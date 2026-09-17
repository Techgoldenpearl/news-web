"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { NewsCard } from "@/components/NewsCard";
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

  if (!data) return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" /></div>;

  return (
    <div>
      <div className="bg-panel border border-line rounded-lg p-5 mb-3.5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl flex items-center gap-1.5"><Hash size={22} className="text-brand" />{data.topic.nameHindi || data.topic.name}</h1>
          {data.topic.description && <p className="text-tx-3 mt-1">{data.topic.description}</p>}
          <span className="flex items-center gap-1.5 text-xs font-medium text-tx-3 mt-2">
            <Users size={12} /> {followersCount} {isHindi ? "फॉलोअर्स" : "followers"} · {data.articles.length} {isHindi ? "लेख" : "articles"}
          </span>
        </div>
        <button onClick={toggleFollow}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition shrink-0 ${following ? "bg-brand-soft text-brand" : "bg-brand text-white hover:opacity-90"}`}>
          {following ? (isHindi ? "फॉलो किया गया" : "Following") : (isHindi ? "फॉलो करें" : "Follow")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.articles.map((a: any) => <NewsCard key={a.id} {...a} />)}
      </div>
      {data.articles.length === 0 && <p className="text-center text-tx-3 py-12">{isHindi ? "इस टॉपिक में कोई लेख नहीं" : "No articles in this topic"}</p>}
    </div>
  );
}
