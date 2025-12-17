"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Bookmark, List } from "@/types";
import { useBookmarkMutation } from "@/hooks/useBookmarkMutation";
import { useToast } from "@/components/ui/ToastProvider";
import { getListsClient, getBookmarkListsClient } from "@/lib/karakeep";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { cn } from "@/lib/utils";

interface BookmarkEditModalProps {
  isOpen: boolean;
  bookmark: Bookmark;
  onClose: () => void;
  onUpdate?: (updated: Bookmark) => void;
  onDelete?: (id: string) => void;
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
  onDelete,
}: BookmarkEditModalProps) {
  const [title, setTitle] = useState(bookmark.title || "");
  const [note, setNote] = useState(bookmark.note || "");
  const [tagInput, setTagInput] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [memberListIds, setMemberListIds] = useState<Set<string>>(new Set());
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [listSearchIndex, setListSearchIndex] = useState(0);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const listSearchRef = useRef<HTMLInputElement>(null);
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

  // Filter to manual lists only (exclude smart lists with queries)
  const manualLists = lists.filter((list) => !list.query);

  // Get current member lists for chip display
  const memberLists = useMemo(
    () => manualLists.filter((list) => memberListIds.has(list.id)),
    [manualLists, memberListIds]
  );

  // Filter lists for predictive search dropdown
  const filteredLists = useMemo(() => {
    if (!listSearch.trim()) return [];
    const search = listSearch.toLowerCase();
    return manualLists
      .filter(
        (list) =>
          !memberListIds.has(list.id) && // Exclude already-added lists
          list.name.toLowerCase().includes(search)
      )
      .slice(0, 8); // Limit results
  }, [manualLists, memberListIds, listSearch]);

  // Handle list search keyboard navigation
  const handleListSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setListSearchIndex((prev) =>
        prev < filteredLists.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setListSearchIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && filteredLists.length > 0) {
      e.preventDefault();
      const selectedList = filteredLists[listSearchIndex];
      if (selectedList) {
        handleToggleList(selectedList.id, false);
        setListSearch("");
        setShowListDropdown(false);
        setListSearchIndex(0);
      }
    } else if (e.key === "Escape") {
      setShowListDropdown(false);
      setListSearch("");
    }
  };

  // Reset search index when filtered results change
  useEffect(() => {
    setListSearchIndex(0);
  }, [filteredLists.length]);

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
              Type to search and add collections
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
            ) : (
              <div className="mt-3 space-y-3">
                {/* Current list memberships as removable chips */}
                {memberLists.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {memberLists.map((list) => (
                      <span
                        key={list.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                      >
                        <span>{list.icon}</span>
                        {list.name}
                        <button
                          onClick={() => handleToggleList(list.id, true)}
                          disabled={mutation.isLoading}
                          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                          aria-label={`Remove from ${list.name}`}
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

                {/* Predictive search input */}
                <div className="relative">
                  <input
                    ref={listSearchRef}
                    type="text"
                    value={listSearch}
                    onChange={(e) => {
                      setListSearch(e.target.value);
                      setShowListDropdown(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (listSearch.trim()) setShowListDropdown(true);
                    }}
                    onBlur={() => {
                      // Delay to allow click on dropdown items
                      setTimeout(() => setShowListDropdown(false), 150);
                    }}
                    onKeyDown={handleListSearchKeyDown}
                    placeholder="Type to add to a list..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />

                  {/* Dropdown results */}
                  {showListDropdown && filteredLists.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                      {filteredLists.map((list, index) => (
                        <button
                          key={list.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            handleToggleList(list.id, false);
                            setListSearch("");
                            setShowListDropdown(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                            index === listSearchIndex
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span>{list.icon}</span>
                          <span>{list.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showListDropdown &&
                    listSearch.trim() &&
                    filteredLists.length === 0 && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg">
                        No matching lists found
                      </div>
                    )}
                </div>

                {/* Empty state */}
                {memberLists.length === 0 && !listSearch && (
                  <p className="text-sm text-muted-foreground">
                    Not in any lists yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={mutation.isLoading}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                Delete
              </button>
            )}
          </div>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          const result = await mutation.remove();
          if (result) {
            toast.success("Bookmark deleted");
            setShowDeleteConfirm(false);
            onClose();
            onDelete?.(bookmark.id);
          } else if (mutation.error) {
            toast.error(mutation.error);
          }
        }}
        title="Delete bookmark?"
        message="Are you sure you want to delete this bookmark? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
