"use client";

import { useState } from "react";
import type { Bookmark } from "@/types";
import { useBookmarkMutation } from "@/hooks/useBookmarkMutation";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  bookmark: Bookmark;
  onUpdate?: (updated: Bookmark) => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  className?: string;
}

/**
 * QuickActions - Inline action buttons for bookmark operations
 *
 * Provides quick access to favorite, archive, edit, and delete actions
 * with optimistic UI updates and toast notifications.
 */
export function QuickActions({
  bookmark,
  onUpdate,
  onDelete,
  onEdit,
  className,
}: QuickActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();
  const mutation = useBookmarkMutation(bookmark, onUpdate);

  const handleToggleFavorite = async () => {
    const result = await mutation.toggleFavorite();
    if (result) {
      toast.success(
        bookmark.favourited
          ? "Removed from favorites"
          : "Added to favorites"
      );
    } else if (mutation.error) {
      toast.error(mutation.error);
    }
  };

  const handleToggleArchive = async () => {
    const result = await mutation.toggleArchive();
    if (result) {
      toast.success(bookmark.archived ? "Unarchived" : "Archived");
    } else if (mutation.error) {
      toast.error(mutation.error);
    }
  };

  const handleDelete = async () => {
    const success = await mutation.remove();
    if (success) {
      toast.success("Bookmark deleted");
      onDelete?.(bookmark.id);
    } else if (mutation.error) {
      toast.error(mutation.error);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg bg-background/90 p-1 shadow-sm backdrop-blur-sm",
          className
        )}
      >
        {/* Favorite */}
        <button
          onClick={handleToggleFavorite}
          disabled={mutation.isLoading}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            bookmark.favourited
              ? "text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={bookmark.favourited ? "Unfavorite" : "Favorite"}
          aria-label={bookmark.favourited ? "Unfavorite" : "Favorite"}
        >
          <svg
            className="h-4 w-4"
            fill={bookmark.favourited ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Archive */}
        <button
          onClick={handleToggleArchive}
          disabled={mutation.isLoading}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            bookmark.archived
              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={bookmark.archived ? "Unarchive" : "Archive"}
          aria-label={bookmark.archived ? "Unarchive" : "Archive"}
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
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l-2.25-2.25M12 13.875V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* Edit */}
        {onEdit && (
          <button
            onClick={onEdit}
            disabled={mutation.isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Edit bookmark"
            aria-label="Edit bookmark"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={mutation.isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
          title="Delete bookmark"
          aria-label="Delete bookmark"
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
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete bookmark?"
        message="This action cannot be undone. The bookmark will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
