"use client";

import { useState, useEffect } from "react";
import type { Bookmark, List } from "@/types";
import { useBookmarkMutation } from "@/hooks/useBookmarkMutation";
import { useToast } from "@/components/ui/ToastProvider";
import { getListsClient, getBookmarkListsClient } from "@/lib/karakeep";
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
  const [tagInput, setTagInput] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [memberListIds, setMemberListIds] = useState<Set<string>>(new Set());
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const toast = useToast();
  const mutation = useBookmarkMutation(bookmark, onUpdate);

  // Reset form when bookmark changes
  useEffect(() => {
    setTitle(bookmark.title || "");
    setNote(bookmark.note || "");
  }, [bookmark.id, bookmark.title, bookmark.note]);

  // Load lists and bookmark membership when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingLists(true);
      Promise.all([
        getListsClient(),
        getBookmarkListsClient(bookmark.id),
      ])
        .then(([allLists, membership]) => {
          setLists(allLists);
          setMemberListIds(new Set(membership.lists.map((l) => l.id)));
        })
        .catch((err) => {
          console.error("Failed to load lists:", err);
          toast.error("Failed to load lists");
        })
        .finally(() => setIsLoadingLists(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookmark.id]); // toast excluded: stable context, only used for error reporting

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

  // Tag management handlers
  const handleAddTags = async () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) return;

    const result = await mutation.attachTags(tags);
    if (result) {
      toast.success(`Added ${tags.length} tag${tags.length !== 1 ? "s" : ""}`);
      setTagInput("");
    } else if (mutation.error) {
      toast.error(mutation.error);
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    const result = await mutation.detachTags([tagName]);
    if (result) {
      toast.success("Tag removed");
    } else if (mutation.error) {
      toast.error(mutation.error);
    }
  };

  // List management handler
  const handleToggleList = async (listId: string, isInList: boolean) => {
    if (isInList) {
      const result = await mutation.removeFromList(listId);
      if (result) {
        setMemberListIds((prev) => {
          const next = new Set(prev);
          next.delete(listId);
          return next;
        });
        toast.success("Removed from list");
      } else if (mutation.error) {
        toast.error(mutation.error);
      }
    } else {
      const result = await mutation.addToList(listId);
      if (result) {
        setMemberListIds((prev) => new Set(prev).add(listId));
        toast.success("Added to list");
      } else if (mutation.error) {
        toast.error(mutation.error);
      }
    }
  };
  const manualLists = lists.filter((list) => !list.query);

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

          {/* Tags Management */}
          <div>
            <label className="block text-sm font-medium text-card-foreground">
              Tags
            </label>

            {/* Current tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {bookmark.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      tag.attachedBy === "human"
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tag.attachedBy === "ai" && (
                      <svg
                        className="h-3 w-3 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                    )}
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.name)}
                      disabled={mutation.isLoading}
                      className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                      aria-label={`Remove ${tag.name} tag`}
                    >
                      <svg
                        className="h-3 w-3"
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
                  </span>
                ))}
              </div>
            )}

            {/* Add tags input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTags();
                  }
                }}
                placeholder="Add tags (comma-separated)..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleAddTags}
                disabled={!tagInput.trim() || mutation.isLoading}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  !tagInput.trim() || mutation.isLoading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Add
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Example: development, javascript, tutorial
            </p>
          </div>

          {/* Lists Management */}
          <div>
            <label className="block text-sm font-medium text-card-foreground">
              Lists
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Add this bookmark to collections
            </p>

            {isLoadingLists ? (
              <div className="mt-3 flex items-center justify-center py-4">
                <svg
                  className="h-5 w-5 animate-spin text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : manualLists.length > 0 ? (
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-md border border-border bg-background p-3">
                {manualLists.map((list) => {
                  const isInList = memberListIds.has(list.id);

                  return (
                    <label
                      key={list.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={isInList}
                        onChange={() => handleToggleList(list.id, isInList)}
                        disabled={mutation.isLoading}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="mr-1">{list.icon}</span>
                      <span className="flex-1">{list.name}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No lists available
              </p>
            )}
          </div>
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
