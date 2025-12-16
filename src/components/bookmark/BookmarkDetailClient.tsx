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
      {/* Floating QuickActions */}
      <div className="fixed bottom-6 right-6 z-30 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        <QuickActions
          bookmark={bookmark}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onEdit={() => setShowEditModal(true)}
        />
      </div>

      {/* Edit Modal */}
      <BookmarkEditModal
        isOpen={showEditModal}
        bookmark={bookmark}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdate}
      />
    </>
  );
}
