"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/**
 * Bookmark toggle state for a single article, shared between the article
 * page and any card (NewsCard, etc.) that wants an inline bookmark button.
 * Fetches the reader's full bookmark list once per (user, articleId) pair —
 * acceptable for now since there's no single "is this bookmarked" endpoint;
 * callers rendering many cards at once should prefer article-page usage
 * where this cost is paid once.
 */
export function useBookmark(articleId: number | undefined) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!user || !articleId) return;
    customerApi.bookmarks()
      .then((r) => setBookmarked(r.data.some((b: any) => b.id === articleId)))
      .catch(() => {});
  }, [user, articleId]);

  const toggle = useCallback(async () => {
    if (!user) { toast.error("Please login to bookmark"); return; }
    if (!articleId) return;
    try {
      if (bookmarked) {
        await customerApi.removeBookmark(articleId);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await customerApi.addBookmark(articleId);
        setBookmarked(true);
        toast.success("Bookmarked!");
      }
    } catch {
      toast.error("Failed");
    }
  }, [user, articleId, bookmarked]);

  return { bookmarked, toggle };
}
