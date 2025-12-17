"use client";

import { useState } from "react";
import type { Bookmark } from "@/types";
import { BookmarkCard, BookmarkCardCompact } from "./BookmarkCard";
import { BookmarkEditModal } from "./BookmarkEditModal";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  /** Use compact card variant for denser layout */
  compact?: boolean;
  /** Number of columns at large breakpoint (default: 3) */
  columns?: 2 | 3 | 4;
  /** Empty state message */
  emptyTitle?: string;
  emptyMessage?: string;
}

/**
 * BookmarkGrid - Responsive grid layout for bookmark cards
 *
 * Adapts from 1 column on mobile to 2-4 columns on larger screens.
 * Supports both standard and compact card variants.
 */
export function BookmarkGrid({
  bookmarks: initialBookmarks,
  compact = false,
  columns = 3,
  emptyTitle = "No bookmarks",
  emptyMessage = "Bookmarks matching your criteria will appear here.",
}: BookmarkGridProps) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  // Handle bookmark update (optimistic UI)
  const handleBookmarkUpdate = (updated: Bookmark) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
  };

  // Handle bookmark delete
  const handleBookmarkDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

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

  // Compact layout uses a single column list
  if (compact) {
    return (
      <>
        <div className="flex flex-col gap-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCardCompact
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={() => setEditingBookmark(bookmark)}
            />
          ))}
        </div>
        {editingBookmark && (
          <BookmarkEditModal
            isOpen={!!editingBookmark}
            bookmark={editingBookmark}
            onClose={() => setEditingBookmark(null)}
            onUpdate={(updated) => {
              handleBookmarkUpdate(updated);
              setEditingBookmark(null);
            }}
            onDelete={(id) => {
              handleBookmarkDelete(id);
              setEditingBookmark(null);
            }}
          />
        )}
      </>
    );
  }

  // Grid column classes based on desired column count
  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <>
      <div className={`grid gap-6 ${columnClasses[columns]}`}>
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onUpdate={handleBookmarkUpdate}
            onDelete={handleBookmarkDelete}
            onEdit={() => setEditingBookmark(bookmark)}
          />
        ))}
      </div>
      {editingBookmark && (
        <BookmarkEditModal
          isOpen={!!editingBookmark}
          bookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
          onUpdate={(updated) => {
            handleBookmarkUpdate(updated);
            setEditingBookmark(null);
          }}
          onDelete={(id) => {
            handleBookmarkDelete(id);
            setEditingBookmark(null);
          }}
        />
      )}
    </>
  );
}
