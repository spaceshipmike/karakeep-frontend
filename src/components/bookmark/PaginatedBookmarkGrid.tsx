"use client";

import { useState, useCallback, useMemo } from "react";
import type { Bookmark } from "@/types";
import { BookmarkCard, BookmarkCardCompact } from "./BookmarkCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { TagFilter, filterBookmarksByTags } from "./TagFilter";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { SourceFilter, filterBookmarksBySources } from "./SourceFilter";
import { SortSelect, sortBookmarks, type SortOption } from "./SortSelect";

interface PaginatedBookmarkGridProps {
  /** Initial bookmarks from server */
  initialBookmarks: Bookmark[];
  /** Initial cursor for pagination */
  initialCursor: string | null;
  /** List ID for list-specific pagination */
  listId?: string;
  /** Search query for search pagination */
  query?: string;
  /** Default view mode */
  defaultViewMode?: ViewMode;
  /** Number of columns at large breakpoint (default: 3) */
  columns?: 2 | 3 | 4;
  /** Empty state message */
  emptyTitle?: string;
  emptyMessage?: string;
  /** Show tag filter */
  showTagFilter?: boolean;
  /** Show view toggle */
  showViewToggle?: boolean;
}

/**
 * PaginatedBookmarkGrid - Client component with "Load More" pagination
 *
 * Wraps BookmarkGrid with state management for cursor-based pagination.
 */
export function PaginatedBookmarkGrid({
  initialBookmarks,
  initialCursor,
  listId,
  query,
  defaultViewMode = "grid",
  columns = 3,
  emptyTitle = "No bookmarks",
  emptyMessage = "Bookmarks matching your criteria will appear here.",
  showTagFilter = true,
  showViewToggle = true,
}: PaginatedBookmarkGridProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<Array<"rss" | "extension" | "mobile" | "api">>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;
    result = filterBookmarksByTags(result, selectedTags);
    result = filterBookmarksBySources(result, selectedSources);
    result = sortBookmarks(result, sortOption);
    return result;
  }, [bookmarks, selectedTags, selectedSources, sortOption]);

  const handleLoadMore = useCallback(
    (newBookmarks: Bookmark[], nextCursor: string | null) => {
      setBookmarks((prev) => [...prev, ...newBookmarks]);
      setCursor(nextCursor);
    },
    []
  );

  // Check if there are any tags to filter by
  const hasTags = bookmarks.some((b) => b.tags && b.tags.length > 0);

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h2 className="font-display text-xl font-medium text-card-foreground">
          {emptyTitle}
        </h2>
        <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Grid column classes based on desired column count
  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  // Check if there are multiple sources to filter by
  const hasSources = new Set(bookmarks.map((b) => b.source)).size > 1;

  // Filter toolbar with tags, sources, sort, and view toggle
  const toolbar = (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {showTagFilter && hasTags ? (
          <TagFilter
            bookmarks={bookmarks}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            className="flex-1"
          />
        ) : (
          <div /> // Spacer
        )}
        <div className="flex items-center gap-3 self-end">
          <SortSelect value={sortOption} onChange={setSortOption} />
          {showViewToggle && (
            <ViewToggle mode={viewMode} onModeChange={setViewMode} />
          )}
        </div>
      </div>
      {hasSources && (
        <SourceFilter
          bookmarks={bookmarks}
          selectedSources={selectedSources}
          onSourcesChange={setSelectedSources}
        />
      )}
    </div>
  );

  const hasActiveFilters = selectedTags.length > 0 || selectedSources.length > 0;
  const emptyFilterState = filteredBookmarks.length === 0 && hasActiveFilters && (
    <div className="rounded-lg border border-border bg-card p-12 text-center">
      <h2 className="font-display text-xl font-medium text-card-foreground">
        No matches
      </h2>
      <p className="mt-2 text-muted-foreground">
        No bookmarks match the selected filters.{" "}
        <button
          onClick={() => {
            setSelectedTags([]);
            setSelectedSources([]);
          }}
          className="text-primary hover:text-primary/80"
        >
          Clear filters
        </button>
      </p>
    </div>
  );

  const isCompact = viewMode === "compact";

  return (
    <div>
      {toolbar}
      {emptyFilterState || (
        <>
          {isCompact ? (
            <div className="flex flex-col gap-3">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCardCompact key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${columnClasses[columns]}`}>
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          )}
          <LoadMoreButton
            initialCursor={cursor}
            listId={listId}
            query={query}
            onLoadMore={handleLoadMore}
          />
        </>
      )}
    </div>
  );
}
