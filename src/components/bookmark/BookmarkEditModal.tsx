"use client";

import { useState, useEffect } from "react";
import type { Bookmark } from "@/types";
import { useBookmarkMutation } from "@/hooks/useBookmarkMutation";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

interface BookmarkEditModalProps {
  isOpen: boolean;
  bookmark: Bookmark;
  onClose: () => void;
  onUpdate?: (updated: Bookmark) => void;
}

/**
 * BookmarkEditModal - Full-featured bookmark editor
 *
 * Editorial aesthetic modal for editing bookmark title, note, and metadata.
 * Maintains the magazine-inspired design language of KarakeepFE.
 */
export function BookmarkEditModal({
  isOpen,
  bookmark,
  onClose,
  onUpdate,
}: BookmarkEditModalProps) {
  const [title, setTitle] = useState(bookmark.title || "");
  const [note, setNote] = useState(bookmark.note || "");
  const toast = useToast();
  const mutation = useBookmarkMutation(bookmark, onUpdate);

  // Reset form when bookmark changes
  useEffect(() => {
    setTitle(bookmark.title || "");
    setNote(bookmark.note || "");
  }, [bookmark.id, bookmark.title, bookmark.note]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const updates: { title?: string; note?: string } = {};

    if (title !== (bookmark.title || "")) {
      updates.title = title;
    }
    if (note !== (bookmark.note || "")) {
      updates.note = note;
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    const promises = [];
    if (updates.title) promises.push(mutation.updateTitle(updates.title));
    if (updates.note) promises.push(mutation.updateNote(updates.note));

    await Promise.all(promises);

    if (mutation.error) {
      toast.error(mutation.error);
    } else {
      toast.success("Bookmark updated");
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="mx-4 w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2
              id="edit-modal-title"
              className="font-display text-xl font-medium text-card-foreground"
            >
              Edit Bookmark
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Title */}
          <div>
            <label
              htmlFor="bookmark-title"
              className="block text-sm font-medium text-card-foreground"
            >
              Title
            </label>
            <input
              id="bookmark-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter bookmark title..."
              autoFocus
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="bookmark-note"
              className="block text-sm font-medium text-card-foreground"
            >
              Note
            </label>
            <textarea
              id="bookmark-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add your notes here..."
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports plain text. Use this to add context or personal annotations.
            </p>
          </div>

          {/* URL (read-only) */}
          {bookmark.content?.url && (
            <div>
              <label className="block text-sm font-medium text-card-foreground">
                URL
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  value={bookmark.content.url}
                  readOnly
                  className="flex-1 truncate rounded-md border border-border/50 bg-muted px-3 py-2 text-sm text-muted-foreground"
                />
                <a
                  href={bookmark.content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
                >
                  Open
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to cancel, <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘</kbd>+<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to save
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              disabled={mutation.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={mutation.isLoading}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
                mutation.isLoading
                  ? "bg-primary/50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              {mutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
