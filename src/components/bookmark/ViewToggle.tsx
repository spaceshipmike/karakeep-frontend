"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "compact";

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * ViewToggle - Switch between grid and compact views
 */
export function ViewToggle({ mode, onModeChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1",
        className
      )}
    >
      <button
        onClick={() => onModeChange("grid")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          mode === "grid"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title="Grid view"
        aria-label="Grid view"
        aria-pressed={mode === "grid"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        onClick={() => onModeChange("compact")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          mode === "compact"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title="Compact view"
        aria-label="Compact view"
        aria-pressed={mode === "compact"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  );
}
