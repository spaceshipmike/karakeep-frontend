/**
 * Bulk Operations Utility
 *
 * Handles sequential bulk operations with concurrency limiting,
 * progress tracking, and error recovery.
 */

import type { Bookmark } from "@/types";

export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  errors: Array<{ bookmarkId: string; error: string }>;
}

export type BulkOperationCallback = (progress: BulkOperationProgress) => void;

/**
 * Execute a bulk operation on multiple bookmarks with concurrency control
 */
export async function executeBulkOperation<T>(
  bookmarkIds: string[],
  operation: (bookmarkId: string) => Promise<T>,
  options: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  } = {}
): Promise<{
  succeeded: string[];
  failed: Array<{ bookmarkId: string; error: string }>;
}> {
  const { concurrency = 3, onProgress } = options;

  const total = bookmarkIds.length;
  const succeeded: string[] = [];
  const failed: Array<{ bookmarkId: string; error: string }> = [];
  const inProgress = new Set<string>();

  const updateProgress = () => {
    if (onProgress) {
      onProgress({
        total,
        completed: succeeded.length,
        failed: failed.length,
        inProgress: inProgress.size,
        errors: failed,
      });
    }
  };

  // Process bookmarks in batches with concurrency limit
  const queue = [...bookmarkIds];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const bookmarkId = queue.shift();
          if (!bookmarkId) break;

          inProgress.add(bookmarkId);
          updateProgress();

          try {
            await operation(bookmarkId);
            succeeded.push(bookmarkId);
          } catch (error) {
            failed.push({
              bookmarkId,
              error: error instanceof Error ? error.message : String(error),
            });
          } finally {
            inProgress.delete(bookmarkId);
            updateProgress();
          }
        }
      })()
    );
  }

  await Promise.all(workers);

  return { succeeded, failed };
}

/**
 * Bulk update bookmark properties
 */
export async function bulkUpdateBookmarks(
  bookmarkIds: string[],
  updates: {
    title?: string;
    note?: string;
    archived?: boolean;
    favourited?: boolean;
  },
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }

      return response.json();
    },
    options
  );
}

/**
 * Bulk delete bookmarks
 */
export async function bulkDeleteBookmarks(
  bookmarkIds: string[],
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }
    },
    options
  );
}

/**
 * Bulk attach tags to bookmarks
 */
export async function bulkAttachTags(
  bookmarkIds: string[],
  tags: string[],
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch("/api/bookmarks/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, tags, action: "attach" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }
    },
    options
  );
}

/**
 * Bulk detach tags from bookmarks
 */
export async function bulkDetachTags(
  bookmarkIds: string[],
  tags: string[],
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch("/api/bookmarks/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, tags, action: "detach" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }
    },
    options
  );
}

/**
 * Bulk add bookmarks to a list
 */
export async function bulkAddToList(
  bookmarkIds: string[],
  listId: string,
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch("/api/bookmarks/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, listId, action: "add" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }
    },
    options
  );
}

/**
 * Bulk remove bookmarks from a list
 */
export async function bulkRemoveFromList(
  bookmarkIds: string[],
  listId: string,
  options?: {
    concurrency?: number;
    onProgress?: BulkOperationCallback;
  }
): Promise<{ succeeded: string[]; failed: Array<{ bookmarkId: string; error: string }> }> {
  return executeBulkOperation(
    bookmarkIds,
    async (bookmarkId) => {
      const response = await fetch("/api/bookmarks/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId, listId, action: "remove" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
      }
    },
    options
  );
}
