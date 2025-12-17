"use client";

import { useState } from "react";
import type { Bookmark } from "@/types";
import { QuickActions } from "./QuickActions";
import { BookmarkEditModal } from "./BookmarkEditModal";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

interface BookmarkDetailClientProps {
  bookmark: Bookmark;
  onUpdate?: (updated: Bookmark) => void;
}

/**
 * BookmarkDetailClient - Client-side interactive wrapper for bookmark detail page
 *
 * Provides QuickActions, edit modal, and keyboard shortcuts for the detail page.
 */
export function BookmarkDetailClient({
  bookmark: initialBookmark,
  onUpdate,
}: BookmarkDetailClientProps) {
  const [bookmark, setBookmark] = useState(initialBookmark);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdate = (updated: Bookmark) => {
    setBookmark(updated);
    onUpdate?.(updated);
  };

  const handleDelete = () => {
    // On delete, redirect back to home
    window.location.href = "/";
  };

  // Keyboard shortcuts
  useKeyboardNavigation({
    onEdit: () => setShowEditModal(true),
  });

  return (
    <>
      {/* Floating QuickActions - positioned top right for visibility */}
      <div className="fixed right-6 top-20 z-30 animate-in fade-in-0 slide-in-from-right-4 duration-300">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm">
          <QuickActions
            bookmark={bookmark}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={() => setShowEditModal(true)}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <BookmarkEditModal
        isOpen={showEditModal}
        bookmark={bookmark}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
