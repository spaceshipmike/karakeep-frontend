"use client";

import { useState, useTransition } from "react";
import type { Bookmark, BookmarkSearchResponse } from "@/types";

interface LoadMoreButtonProps {
  /** Initial cursor for the next page */
  initialCursor: string | null;
  /** List ID for list-specific pagination */
  listId?: string;
  /** Search query for search pagination */
  query?: string;
  /** Callback when new bookmarks are loaded */
  onLoadMore: (bookmarks: Bookmark[], nextCursor: string | null) => void;
}

/**
 * LoadMoreButton - Client component for cursor-based pagination
 *
 * Fetches the next page of bookmarks and passes them to parent via callback.
 */
export function LoadMoreButton({
  initialCursor,
  listId,
  query,
  onLoadMore,
}: LoadMoreButtonProps) {
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!cursor) {
    return null;
  }

  const handleLoadMore = () => {
    setError(null);

    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set("cursor", cursor);
        params.set("limit", "50");

        if (listId) {
          params.set("listId", listId);
        }
        if (query) {
          params.set("q", query);
        }

        const response = await fetch(`/api/bookmarks?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load more bookmarks");
        }

        const data: BookmarkSearchResponse = await response.json();
        setCursor(data.nextCursor);
        onLoadMore(data.bookmarks, data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load more");
      }
    });
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <button
        onClick={handleLoadMore}
        disabled={isPending}
        className="rounded-full border border-border bg-card px-6 py-2.5 font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Loading..." : "Load More"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
