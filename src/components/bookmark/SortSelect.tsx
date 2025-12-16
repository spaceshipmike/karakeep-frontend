"use client";

import { cn } from "@/lib/utils";
import type { Bookmark } from "@/types";

export type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "title-asc": "Title A-Z",
  "title-desc": "Title Z-A",
};

/**
 * SortSelect - Dropdown for sorting bookmarks
 */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        Sort:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {(Object.keys(sortLabels) as SortOption[]).map((option) => (
          <option key={option} value={option}>
            {sortLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Sort bookmarks by the selected option
 */
export function sortBookmarks(bookmarks: Bookmark[], sort: SortOption): Bookmark[] {
  const sorted = [...bookmarks];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "title-asc":
      return sorted.sort((a, b) => {
        const titleA = a.title || a.content?.title || "";
        const titleB = b.title || b.content?.title || "";
        return titleA.localeCompare(titleB);
      });
    case "title-desc":
      return sorted.sort((a, b) => {
        const titleA = a.title || a.content?.title || "";
        const titleB = b.title || b.content?.title || "";
        return titleB.localeCompare(titleA);
      });
    default:
      return sorted;
  }
}
