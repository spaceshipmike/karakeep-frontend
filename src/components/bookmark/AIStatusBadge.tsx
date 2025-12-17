"use client";

import { cn } from "@/lib/utils";

interface AIStatusBadgeProps {
  summarizationStatus?: "success" | "pending";
  taggingStatus?: "success" | "pending";
  variant?: "compact" | "detailed";
  className?: string;
}

/**
 * AIStatusBadge - Shows AI processing status for bookmarks
 *
 * Displays subtle indicators when AI summarization or tagging is pending.
 * Maintains editorial aesthetic with minimal, non-intrusive design.
 */
export function AIStatusBadge({
  summarizationStatus,
  taggingStatus,
  variant = "compact",
  className,
}: AIStatusBadgeProps) {
  const hasPendingSummarization = summarizationStatus === "pending";
  const hasPendingTagging = taggingStatus === "pending";
  const hasPending = hasPendingSummarization || hasPendingTagging;

  // Don't show anything if both are successful (or undefined)
  if (!hasPending) return null;

  // Build descriptive tooltip
  const pendingItems = [];
  if (hasPendingSummarization) pendingItems.push("summary");
  if (hasPendingTagging) pendingItems.push("tags");
  const tooltip = `AI is generating ${pendingItems.join(" and ")} for this bookmark`;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative flex cursor-help items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 dark:bg-amber-950",
          className
        )}
        title={tooltip}
      >
        <svg
          className="h-3 w-3 animate-spin text-amber-600 dark:text-amber-400"
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
        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
          AI
        </span>
        {/* Enhanced tooltip on hover */}
        <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 w-48 scale-95 rounded-md bg-popover p-2 text-xs text-popover-foreground opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
          {tooltip}
        </div>
      </div>
    );
  }

  // Detailed variant for detail pages
  return (
    <div className={cn("space-y-2 text-sm", className)}>
      {hasPendingSummarization && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          <span className="text-xs font-medium">Generating summary...</span>
        </div>
      )}
      {hasPendingTagging && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          <span className="text-xs font-medium">Generating tags...</span>
        </div>
      )}
    </div>
  );
}
