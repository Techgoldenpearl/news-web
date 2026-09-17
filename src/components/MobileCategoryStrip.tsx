"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { dedupeCategories } from "@/lib/categories";
import type { Category } from "@/types";

/** Horizontally-scrollable category strip under the mobile header — the
 * fast category-switching path that the (now-removed) hamburger sidebar
 * used to cover on mobile. Same category data/dedup as Sidebar.tsx. */
export function MobileCategoryStrip() {
  const { isHindi, site } = useSite();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    publicApi.categories().then((r) => {
      const visible = (r.data as Category[]).filter((c) => c.showInNav);
      setCategories(dedupeCategories(visible, site?.id));
    }).catch(() => {});
  }, [site?.id]);

  return (
    <div className="lg:hidden bg-panel border-b border-line">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 chip-scroller">
        <Link
          href="/home"
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap transition ${
            pathname === "/home" ? "bg-brand text-white" : "text-tx-2 bg-panel-2"
          }`}
        >
          <Flame size={13} /> {isHindi ? "टॉप न्यूज़" : "Top News"}
        </Link>
        {categories.map((c) => {
          const href = `/category/${c.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={c.id}
              href={href}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap transition ${
                active ? "bg-brand text-white" : "text-tx-2 bg-panel-2"
              }`}
            >
              {isHindi ? (c.nameHindi || c.name) : c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
