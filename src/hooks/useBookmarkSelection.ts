"use client";

import { useState, useCallback } from "react";

/**
 * useBookmarkSelection - Multi-select state management for bookmarks
 *
 * Provides selection mode toggle, multi-select operations,
 * and keyboard-driven selection.
 */
export function useBookmarkSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    // Clear selection when exiting selection mode
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  const toggleSelection = useCallback((bookmarkId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) {
        next.delete(bookmarkId);
      } else {
        next.add(bookmarkId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((bookmarkIds: string[]) => {
    setSelectedIds(new Set(bookmarkIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (bookmarkId: string) => selectedIds.has(bookmarkId),
    [selectedIds]
  );

  return {
    isSelectionMode,
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
