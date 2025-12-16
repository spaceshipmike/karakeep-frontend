"use client";

import { cn } from "@/lib/utils";
import type { BulkOperationState } from "@/hooks/useBulkOperation";

interface BulkProgressModalProps {
  isOpen: boolean;
  operation: string;
  progress: BulkOperationState;
  onClose?: () => void;
}

/**
 * BulkProgressModal - Progress tracking for bulk operations
 *
 * Shows real-time progress with count, progress bar, and error summary.
 * Minimal, focused design for non-intrusive feedback during bulk operations.
 */
export function BulkProgressModal({
  isOpen,
  operation,
  progress,
  onClose,
}: BulkProgressModalProps) {
  if (!isOpen) return null;

  const { total, completed, failed, inProgress, isRunning, errors } = progress;
  const percentage = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;
  const hasErrors = errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-medium text-card-foreground">
              {operation}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {completed + failed} of {total} bookmarks
            </p>
          </div>
          {!isRunning && onClose && (
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
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                hasErrors ? "bg-rose-500" : "bg-primary"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{percentage}% complete</span>
            {inProgress > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3 w-3 animate-spin"
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
                {inProgress} in progress
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          {completed > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {completed} succeeded
            </div>
          )}
          {failed > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {failed} failed
            </div>
          )}
        </div>

        {/* Error details */}
        {hasErrors && errors.length <= 3 && (
          <div className="mt-4 space-y-1">
            {errors.map((error, index) => (
              <p
                key={index}
                className="text-xs text-rose-600 dark:text-rose-400"
              >
                {error.error}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
