"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Bookmark } from "@/types";

interface TagFilterProps {
  bookmarks: Bookmark[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

interface TagCount {
  name: string;
  count: number;
}

/**
 * TagFilter - Multi-select tag filtering component
 *
 * Extracts unique tags from bookmarks and allows filtering by tag selection.
 */
export function TagFilter({
  bookmarks,
  selectedTags,
  onTagsChange,
  className,
}: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract and count tags from bookmarks
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    bookmarks.forEach((bookmark) => {
      bookmark.tags?.forEach((tag) => {
        counts.set(tag.name, (counts.get(tag.name) || 0) + 1);
      });
    });

    // Sort by count descending, then alphabetically
    return Array.from(counts.entries())
      .map(([name, count]): TagCount => ({ name, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
  }, [bookmarks]);

  if (tagCounts.length === 0) {
    return null;
  }

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  const visibleTags = isExpanded ? tagCounts : tagCounts.slice(0, 8);
  const hasMore = tagCounts.length > 8;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Filter by Tag
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAll}
            className="font-mono text-[10px] uppercase tracking-wider text-primary hover:text-primary/80"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <button
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span>{tag.name}</span>
              <span
                className={cn(
                  "text-[10px]",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60"
                )}
              >
                {tag.count}
              </span>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? "Show less" : `Show ${tagCounts.length - 8} more`}
        </button>
      )}
    </div>
  );
}

/**
 * Filter bookmarks by selected tags (AND logic - must have all selected tags)
 */
export function filterBookmarksByTags(
  bookmarks: Bookmark[],
  selectedTags: string[]
): Bookmark[] {
  if (selectedTags.length === 0) return bookmarks;

  return bookmarks.filter((bookmark) => {
    const bookmarkTagNames = bookmark.tags?.map((t) => t.name) || [];
    return selectedTags.every((tag) => bookmarkTagNames.includes(tag));
  });
}
