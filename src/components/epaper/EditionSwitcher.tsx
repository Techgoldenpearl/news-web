"use client";

import { useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { toast } from "sonner";
import { Newspaper } from "lucide-react";

function toEditionSlug(edition: string) {
  return edition.trim() ? encodeURIComponent(edition.trim().toLowerCase().replace(/\s+/g, "-")) : "national";
}

interface EditionSwitcherProps {
  editions: string[];
  currentEdition: string;
  dateIso: string;
}

export default function EditionSwitcher({ editions, currentEdition, dateIso }: EditionSwitcherProps) {
  const router = useRouter();
  const { isHindi } = useSite();

  if (editions.length <= 1) return null;

  const handleChange = async (edition: string) => {
    try {
      const { data } = await publicApi.epaperByDate(dateIso, edition);
      router.push(`/epaper/${toEditionSlug(edition)}/${data.id}/${dateIso}`);
    } catch {
      toast.error(isHindi ? "इस संस्करण के लिए कोई अंक नहीं मिला" : "No issue found for this edition");
    }
  };

  return (
    <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1.5 bg-white">
      <Newspaper size={14} className="text-gray-400" />
      <select
        value={currentEdition}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm bg-transparent outline-none cursor-pointer"
      >
        {editions.map((ed) => (
          <option key={ed} value={ed}>{ed || (isHindi ? "राष्ट्रीय" : "National")}</option>
        ))}
      </select>
    </div>
  );
}
