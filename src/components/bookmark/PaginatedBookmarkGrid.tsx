"use client";

import { useState, useCallback, useMemo } from "react";
import type { Bookmark } from "@/types";
import { BookmarkCard, BookmarkCardCompact } from "./BookmarkCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { TagFilter, filterBookmarksByTags } from "./TagFilter";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { SourceFilter, filterBookmarksBySources } from "./SourceFilter";
import { SortSelect, sortBookmarks, type SortOption } from "./SortSelect";
import { useBookmarkSelection } from "@/hooks/useBookmarkSelection";
import { cn } from "@/lib/utils";

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

  // Selection state
  const selection = useBookmarkSelection();

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

  // Handle selection of all visible bookmarks
  const handleSelectAll = () => {
    const visibleIds = filteredBookmarks.map((b) => b.id);
    selection.selectAll(visibleIds);
  };

  // Filter toolbar with tags, sources, sort, view toggle, and selection mode
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
          {/* Selection mode toggle */}
          <button
            onClick={selection.toggleSelectionMode}
            className={cn(
              "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              selection.isSelectionMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border bg-background hover:bg-muted"
            )}
            title="Toggle selection mode"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {selection.isSelectionMode && selection.selectedCount > 0 && (
              <span>{selection.selectedCount}</span>
            )}
          </button>

          <SortSelect value={sortOption} onChange={setSortOption} />
          {showViewToggle && (
            <ViewToggle mode={viewMode} onModeChange={setViewMode} />
          )}
        </div>
      </div>

      {/* Select all checkbox when in selection mode */}
      {selection.isSelectionMode && filteredBookmarks.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                selection.selectedCount === filteredBookmarks.length
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {selection.selectedCount === filteredBookmarks.length && (
                <svg
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            Select all ({filteredBookmarks.length})
          </button>
          {selection.selectedCount > 0 && (
            <button
              onClick={selection.clearSelection}
              className="ml-2 text-primary hover:text-primary/80"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

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

  // Handle bookmark update (optimistic UI)
  const handleBookmarkUpdate = (updated: Bookmark) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
  };

  // Handle bookmark delete
  const handleBookmarkDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    // Also remove from selection if selected
    if (selection.isSelected(id)) {
      selection.toggleSelection(id);
    }
  };

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
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  isSelectionMode={selection.isSelectionMode}
                  isSelected={selection.isSelected(bookmark.id)}
                  onToggleSelection={() => selection.toggleSelection(bookmark.id)}
                  onUpdate={handleBookmarkUpdate}
                  onDelete={handleBookmarkDelete}
                />
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
