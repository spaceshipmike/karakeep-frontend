"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BulkTagModalProps {
  isOpen: boolean;
  mode: "add" | "remove";
  selectedCount: number;
  onConfirm: (tags: string[]) => void;
  onClose: () => void;
}

/**
 * BulkTagModal - Add or remove tags from multiple bookmarks
 *
 * Simple tag input with comma-separated values.
 * Editorial aesthetic with clear action flow.
 */
export function BulkTagModal({
  isOpen,
  mode,
  selectedCount,
  onConfirm,
  onClose,
}: BulkTagModalProps) {
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) return;

    onConfirm(tags);
    setTagInput("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isAdd = mode === "add";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <h2 className="font-display text-xl font-medium text-card-foreground">
          {isAdd ? "Add Tags" : "Remove Tags"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAdd ? "Add tags to" : "Remove tags from"} {selectedCount} selected bookmark{selectedCount !== 1 ? "s" : ""}
        </p>

        <div className="mt-5">
          <label htmlFor="tag-input" className="block text-sm font-medium text-card-foreground">
            Tags
          </label>
          <input
            id="tag-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Enter tags separated by commas..."
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Example: development, javascript, tutorial
          </p>
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
            disabled={tagInput.trim().length === 0}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
              tagInput.trim().length === 0
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            {isAdd ? "Add Tags" : "Remove Tags"}
          </button>
        </div>
      </div>
    </div>
  );
}
