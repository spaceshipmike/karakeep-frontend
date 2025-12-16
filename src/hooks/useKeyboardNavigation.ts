"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * useKeyboardNavigation - Global keyboard shortcuts
 *
 * Provides app-wide keyboard navigation:
 * - / : Focus search input
 * - Escape : Clear focus / close modals
 */
export function useKeyboardNavigation() {
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

      // ? to show keyboard shortcuts help (future feature)
      if (e.key === "?" && !isInput && e.shiftKey) {
        e.preventDefault();
        // Could show a modal with keyboard shortcuts
        console.log("Keyboard shortcuts: / = search, Escape = unfocus");
      }

      // g then h to go home (vim-style navigation)
      // This would require state tracking for the "g" prefix
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
