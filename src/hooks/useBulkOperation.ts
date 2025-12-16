"use client";

import { useState, useCallback } from "react";
import type { BulkOperationProgress } from "@/lib/bulk-operations";
import {
  bulkUpdateBookmarks,
  bulkDeleteBookmarks,
  bulkAttachTags,
  bulkDetachTags,
  bulkAddToList,
  bulkRemoveFromList,
} from "@/lib/bulk-operations";

export interface BulkOperationState extends BulkOperationProgress {
  isRunning: boolean;
}

/**
 * useBulkOperation - Progress tracking for bulk bookmark operations
 *
 * Wraps bulk operation utilities with React state management,
 * providing real-time progress updates and completion status.
 */
export function useBulkOperation() {
  const [state, setState] = useState<BulkOperationState>({
    isRunning: false,
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    errors: [],
  });

  const onProgress = useCallback((progress: BulkOperationProgress) => {
    setState((prev) => ({
      ...prev,
      ...progress,
    }));
  }, []);

  const updateBookmarks = useCallback(
    async (
      bookmarkIds: string[],
      updates: {
        title?: string;
        note?: string;
        archived?: boolean;
        favourited?: boolean;
      }
    ) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkUpdateBookmarks(bookmarkIds, updates, {
        onProgress,
      });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const deleteBookmarks = useCallback(
    async (bookmarkIds: string[]) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkDeleteBookmarks(bookmarkIds, { onProgress });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const attachTags = useCallback(
    async (bookmarkIds: string[], tags: string[]) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkAttachTags(bookmarkIds, tags, { onProgress });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const detachTags = useCallback(
    async (bookmarkIds: string[], tags: string[]) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkDetachTags(bookmarkIds, tags, { onProgress });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const addToList = useCallback(
    async (bookmarkIds: string[], listId: string) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkAddToList(bookmarkIds, listId, { onProgress });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const removeFromList = useCallback(
    async (bookmarkIds: string[], listId: string) => {
      setState({
        isRunning: true,
        total: bookmarkIds.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        errors: [],
      });

      const result = await bulkRemoveFromList(bookmarkIds, listId, {
        onProgress,
      });

      setState((prev) => ({ ...prev, isRunning: false }));
      return result;
    },
    [onProgress]
  );

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: 0,
      errors: [],
    });
  }, []);

  return {
    ...state,
    updateBookmarks,
    deleteBookmarks,
    attachTags,
    detachTags,
    addToList,
    removeFromList,
    reset,
  };
}
