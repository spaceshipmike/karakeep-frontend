"use client";

import { useState, useEffect } from "react";
import type { List } from "@/types";
import { getLists } from "@/lib/karakeep";
import { cn } from "@/lib/utils";

interface BulkListModalProps {
  isOpen: boolean;
  selectedCount: number;
  onConfirm: (listId: string) => void;
  onClose: () => void;
}

/**
 * BulkListModal - Add multiple bookmarks to a list
 *
 * Simple list picker with hierarchical display.
 * Editorial aesthetic with clear action flow.
 */
export function BulkListModal({
  isOpen,
  selectedCount,
  onConfirm,
  onClose,
}: BulkListModalProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getLists()
        .then(setLists)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedListId) return;
    onConfirm(selectedListId);
    setSelectedListId(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter out smart lists (they're dynamic, can't manually add to them)
  const manualLists = lists.filter((list) => !list.query);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <h2 className="font-display text-xl font-medium text-card-foreground">
          Add to List
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add {selectedCount} selected bookmark{selectedCount !== 1 ? "s" : ""} to a list
        </p>

        <div className="mt-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="h-6 w-6 animate-spin text-primary"
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
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-2">
              {manualLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    selectedListId === list.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span>{list.icon}</span>
                  <span className="flex-1">{list.name}</span>
                  {selectedListId === list.id && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
              {manualLists.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No lists available
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedListId}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
              !selectedListId
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            Add to List
          </button>
        </div>
      </div>
    </div>
  );
}
