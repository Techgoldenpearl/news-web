"use client";

import { useEffect, useState } from "react";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CommentSectionProps {
  articleId: number;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const { isHindi } = useSite();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    publicApi.comments(articleId).then((r) => setComments(r.data)).catch(() => {});
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) { toast.error(isHindi ? "टिप्पणी करने के लिए लॉगिन करें" : "Please login to comment"); return; }

    setSubmitting(true);
    try {
      await customerApi.addComment(articleId, content);
      toast.success(isHindi ? "टिप्पणी समीक्षा के लिए भेजी गई" : "Comment submitted for moderation");
      setContent("");
      setReplyTo(null);
    } catch { toast.error(isHindi ? "टिप्पणी पोस्ट करने में विफल" : "Failed to post comment"); }
    finally { setSubmitting(false); }
  };

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <MessageCircle size={20} /> {isHindi ? "टिप्पणियाँ" : "Comments"} ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
            {user ? user.name?.[0]?.toUpperCase() || "U" : "?"}
          </div>
          <div className="flex-1">
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder={user ? (isHindi ? "टिप्पणी लिखें..." : "Write a comment...") : (isHindi ? "टिप्पणी करने के लिए लॉगिन करें" : "Login to comment")}
              disabled={!user}
              rows={3} className="w-full px-4 py-3 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-orange-300 focus:border-brand disabled:bg-gray-50" />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={submitting || !user || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition">
                <Send size={14} /> {submitting ? (isHindi ? "पोस्ट हो रहा है..." : "Posting...") : (isHindi ? "टिप्पणी पोस्ट करें" : "Post Comment")}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {topLevel.map((comment) => (
          <div key={comment.id}>
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {comment.userName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.userName || (isHindi ? "अज्ञात" : "Anonymous")}</span>
                  <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), "dd MMM yyyy, h:mm a")}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>

            {getReplies(comment.id).length > 0 && (
              <div className="ml-12 mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {reply.userName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{reply.userName || (isHindi ? "अज्ञात" : "Anonymous")}</span>
                        <span className="text-xs text-gray-400">{format(new Date(reply.createdAt), "dd MMM yyyy")}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && <p className="text-center text-gray-400 py-6">{isHindi ? "अभी तक कोई टिप्पणी नहीं। सबसे पहले टिप्पणी करें!" : "No comments yet. Be the first!"}</p>}
      </div>
    </div>
  );
}
