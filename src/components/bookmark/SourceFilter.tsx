"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Bookmark } from "@/types";

type BookmarkSource = "rss" | "extension" | "mobile" | "api";

interface SourceFilterProps {
  bookmarks: Bookmark[];
  selectedSources: BookmarkSource[];
  onSourcesChange: (sources: BookmarkSource[]) => void;
  className?: string;
}

interface SourceInfo {
  name: BookmarkSource;
  label: string;
  count: number;
}

const sourceLabels: Record<BookmarkSource, string> = {
  rss: "RSS",
  extension: "Extension",
  mobile: "Mobile",
  api: "API",
};

/**
 * SourceFilter - Filter bookmarks by source
 */
export function SourceFilter({
  bookmarks,
  selectedSources,
  onSourcesChange,
  className,
}: SourceFilterProps) {
  // Count bookmarks per source
  const sourceCounts = useMemo(() => {
    const counts = new Map<BookmarkSource, number>();

    bookmarks.forEach((bookmark) => {
      const source = bookmark.source as BookmarkSource;
      if (source) {
        counts.set(source, (counts.get(source) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([name, count]): SourceInfo => ({
        name,
        label: sourceLabels[name] || name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [bookmarks]);

  if (sourceCounts.length <= 1) {
    return null;
  }

  const toggleSource = (source: BookmarkSource) => {
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter((s) => s !== source));
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        Source:
      </span>
      {sourceCounts.map((source) => {
        const isSelected = selectedSources.includes(source.name);
        return (
          <button
            key={source.name}
            onClick={() => toggleSource(source.name)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span>{source.label}</span>
            <span className={cn("text-[10px]", isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60")}>
              {source.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Filter bookmarks by selected sources
 */
export function filterBookmarksBySources(
  bookmarks: Bookmark[],
  selectedSources: BookmarkSource[]
): Bookmark[] {
  if (selectedSources.length === 0) return bookmarks;

  return bookmarks.filter((bookmark) =>
    selectedSources.includes(bookmark.source as BookmarkSource)
  );
}
