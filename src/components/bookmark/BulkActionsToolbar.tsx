"use client";

import { cn } from "@/lib/utils";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onArchive?: () => void;
  onFavorite?: () => void;
  onAddTags?: () => void;
  onRemoveTags?: () => void;
  onAddToList?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

/**
 * BulkActionsToolbar - Floating action bar for selected bookmarks
 *
 * Appears when bookmarks are selected, providing bulk operations.
 * Minimal, focused design with essential actions.
 */
export function BulkActionsToolbar({
  selectedCount,
  onArchive,
  onFavorite,
  onAddTags,
  onRemoveTags,
  onAddToList,
  onDelete,
  onCancel,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-2xl backdrop-blur-sm">
        {/* Selected count */}
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-card-foreground">
            selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Toggle favorite"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Favorite
            </button>
          )}

          {onArchive && (
            <button
              onClick={onArchive}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Archive"
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
              Archive
            </button>
          )}

          {onAddTags && (
            <button
              onClick={onAddTags}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Add tags"
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
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
              Add Tags
            </button>
          )}

          {onAddToList && (
            <button
              onClick={onAddToList}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Add to list"
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
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                />
              </svg>
              Add to List
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950"
              title="Delete"
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

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-2 flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
