"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";

function toEditionSlug(edition: string) {
  return edition.trim() ? encodeURIComponent(edition.trim().toLowerCase().replace(/\s+/g, "-")) : "national";
}

// Legacy /epaper/[id] URLs redirect here, then on to the edition-first /epaper/[edition]/[id]/[date] route.
export default function LegacyEpaperRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    publicApi.epaperIssue(Number(id))
      .then((r) => {
        const issue = r.data;
        const dateIso = new Date(issue.issueDate).toISOString().slice(0, 10);
        router.replace(`/epaper/${toEditionSlug(issue.edition)}/${issue.id}/${dateIso}`);
      })
      .catch(() => setNotFound(true));
  }, [id, router]);

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Issue not found</h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" />
    </div>
  );
}
