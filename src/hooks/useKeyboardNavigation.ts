"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface KeyboardShortcutHandlers {
  onEdit?: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onToggleSelection?: () => void;
  onSelectAll?: () => void;
  onAddTags?: () => void;
  onAddToList?: () => void;
  /** Called when 1-9 is pressed, with the list index (0-8) */
  onQuickList?: (index: number) => void;
}

/**
 * useKeyboardNavigation - Global keyboard shortcuts
 *
 * Provides app-wide keyboard navigation:
 * - / : Focus search input
 * - Escape : Clear focus / close modals
 * - e : Edit current/selected bookmark(s)
 * - f : Toggle favorite
 * - a : Archive/unarchive
 * - x : Toggle selection mode
 * - Cmd/Ctrl+A : Select all (when in selection mode)
 * - Delete/Backspace : Delete with confirmation
 * - t : Add tags
 * - l : Add to list
 * - 1-9 : Quick add to list by position
 */
export function useKeyboardNavigation(handlers?: KeyboardShortcutHandlers) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // / to focus search (when not in an input)
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to blur current element
      if (e.key === "Escape") {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }

      // Edit operations (only when not in input)
      if (!isInput && handlers) {
        // e - Edit
        if (e.key === "e" && handlers.onEdit) {
          e.preventDefault();
          handlers.onEdit();
        }

        // f - Toggle favorite
        if (e.key === "f" && handlers.onFavorite) {
          e.preventDefault();
          handlers.onFavorite();
        }

        // a - Archive
        if (e.key === "a" && handlers.onArchive) {
          e.preventDefault();
          handlers.onArchive();
        }

        // x - Toggle selection mode
        if (e.key === "x" && handlers.onToggleSelection) {
          e.preventDefault();
          handlers.onToggleSelection();
        }

        // Cmd/Ctrl+A - Select all
        if (
          e.key === "a" &&
          (e.metaKey || e.ctrlKey) &&
          handlers.onSelectAll
        ) {
          e.preventDefault();
          handlers.onSelectAll();
        }

        // Delete/Backspace - Delete
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          handlers.onDelete &&
          !e.metaKey &&
          !e.ctrlKey
        ) {
          e.preventDefault();
          handlers.onDelete();
        }

        // t - Add tags
        if (e.key === "t" && handlers.onAddTags) {
          e.preventDefault();
          handlers.onAddTags();
        }

        // l - Add to list
        if (e.key === "l" && handlers.onAddToList) {
          e.preventDefault();
          handlers.onAddToList();
        }

        // 1-9 - Quick add to list by position
        if (handlers.onQuickList) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 9) {
            e.preventDefault();
            handlers.onQuickList(num - 1); // Convert to 0-indexed
          }
        }
      }

      // ? to show keyboard shortcuts help (future feature)
      if (e.key === "?" && !isInput && e.shiftKey) {
        e.preventDefault();
        console.log(
          "Keyboard shortcuts:\n" +
          "/ = search\n" +
          "e = edit\n" +
          "f = favorite\n" +
          "a = archive\n" +
          "x = selection mode\n" +
          "Cmd+A = select all\n" +
          "Delete = delete\n" +
          "t = add tags\n" +
          "l = add to list\n" +
          "1-9 = quick add to list\n" +
          "Escape = close/unfocus"
        );
      }
    },
    [router, handlers]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
