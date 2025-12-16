"use client";

import { useState, useCallback } from "react";
import type { Bookmark } from "@/types";
import {
  updateBookmark,
  deleteBookmark,
  addTagsToBookmark,
  removeTagsFromBookmark,
  addBookmarkToList,
  removeBookmarkFromList,
} from "@/lib/karakeep";

export interface MutationState {
  isLoading: boolean;
  error: string | null;
}

/**
 * useBookmarkMutation - Hook for bookmark mutations with optimistic updates
 *
 * Provides mutation functions that update local state immediately,
 * then sync with server. Rolls back on error.
 */
export function useBookmarkMutation(
  bookmark: Bookmark,
  onUpdate?: (updated: Bookmark) => void
) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const executeWithOptimism = useCallback(
    async <T,>(
      optimisticUpdate: (bookmark: Bookmark) => Bookmark,
      serverMutation: () => Promise<T>
    ): Promise<T | null> => {
      setState({ isLoading: true, error: null });

      // Apply optimistic update
      const optimisticBookmark = optimisticUpdate(bookmark);
      onUpdate?.(optimisticBookmark);

      try {
        const result = await serverMutation();
        setState({ isLoading: false, error: null });
        return result;
      } catch (error) {
        // Rollback on error
        onUpdate?.(bookmark);
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    },
    [bookmark, onUpdate]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      return executeWithOptimism(
        (b) => ({ ...b, title }),
        () => updateBookmark(bookmark.id, { title })
      );
    },
    [bookmark.id, executeWithOptimism]
  );

  const updateNote = useCallback(
    async (note: string) => {
      return executeWithOptimism(
        (b) => ({ ...b, note }),
        () => updateBookmark(bookmark.id, { note })
      );
    },
    [bookmark.id, executeWithOptimism]
  );

  const toggleFavorite = useCallback(async () => {
    return executeWithOptimism(
      (b) => ({ ...b, favourited: !b.favourited }),
      () => updateBookmark(bookmark.id, { favourited: !bookmark.favourited })
    );
  }, [bookmark.id, bookmark.favourited, executeWithOptimism]);

  const toggleArchive = useCallback(async () => {
    return executeWithOptimism(
      (b) => ({ ...b, archived: !b.archived }),
      () => updateBookmark(bookmark.id, { archived: !bookmark.archived })
    );
  }, [bookmark.id, bookmark.archived, executeWithOptimism]);

  const remove = useCallback(async () => {
    setState({ isLoading: true, error: null });
    try {
      await deleteBookmark(bookmark.id);
      setState({ isLoading: false, error: null });
      return true;
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }, [bookmark.id]);

  const attachTags = useCallback(
    async (tags: string[]) => {
      return executeWithOptimism(
        (b) => ({
          ...b,
          tags: [
            ...(b.tags || []),
            ...tags.map((name) => ({
              id: `temp-${name}`,
              name,
              attachedBy: "human" as const,
            })),
          ],
        }),
        () => addTagsToBookmark(bookmark.id, tags)
      );
    },
    [bookmark.id, executeWithOptimism]
  );

  const detachTags = useCallback(
    async (tags: string[]) => {
      return executeWithOptimism(
        (b) => ({
          ...b,
          tags: (b.tags || []).filter((t) => !tags.includes(t.name)),
        }),
        () => removeTagsFromBookmark(bookmark.id, tags)
      );
    },
    [bookmark.id, executeWithOptimism]
  );

  const addToList = useCallback(
    async (listId: string) => {
      setState({ isLoading: true, error: null });
      try {
        await addBookmarkToList(bookmark.id, listId);
        setState({ isLoading: false, error: null });
        return true;
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    },
    [bookmark.id]
  );

  const removeFromList = useCallback(
    async (listId: string) => {
      setState({ isLoading: true, error: null });
      try {
        await removeBookmarkFromList(bookmark.id, listId);
        setState({ isLoading: false, error: null });
        return true;
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    },
    [bookmark.id]
  );

  return {
    ...state,
    updateTitle,
    updateNote,
    toggleFavorite,
    toggleArchive,
    remove,
    attachTags,
    detachTags,
    addToList,
    removeFromList,
  };
}
