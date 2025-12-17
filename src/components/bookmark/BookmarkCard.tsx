"use client";

import Link from "next/link";
import { useState } from "react";
import type { Bookmark } from "@/types";
import { getBookmarkScreenshotUrl, getBookmarkTitle } from "@/lib/karakeep";
import { QuickActions } from "./QuickActions";
import { AIStatusBadge } from "./AIStatusBadge";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  /** Show full summary without truncation */
  expandSummary?: boolean;
  /** Selection mode - show checkbox and enable selection */
  isSelectionMode?: boolean;
  /** Whether this bookmark is selected */
  isSelected?: boolean;
  /** Callback when selection state changes */
  onToggleSelection?: () => void;
  /** Callback when bookmark is updated */
  onUpdate?: (updated: Bookmark) => void;
  /** Callback when bookmark is deleted */
  onDelete?: (id: string) => void;
  /** Callback to open edit modal */
  onEdit?: () => void;
}

/**
 * BookmarkCard - Editorial-style bookmark display
 *
 * Features large screenshot hero, AI-generated summaries,
 * tag chips with AI/human distinction, and subtle hover states.
 * Supports selection mode and quick actions.
 */
export function BookmarkCard({
  bookmark,
  expandSummary = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onUpdate,
  onDelete,
  onEdit,
}: BookmarkCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const screenshotUrl = getBookmarkScreenshotUrl(bookmark);
  const title = getBookmarkTitle(bookmark);
  const url = bookmark.content?.url;
  const favicon = bookmark.content?.favicon;
  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Separate AI and human tags for visual distinction
  const aiTags = bookmark.tags?.filter((t) => t.attachedBy === "ai") || [];
  const humanTags = bookmark.tags?.filter((t) => t.attachedBy === "human") || [];
  const allTags = [...humanTags, ...aiTags]; // Human tags first, then AI

  const handleCardClick = (e: React.MouseEvent) => {
    // In selection mode, clicking the card toggles selection
    if (isSelectionMode && onToggleSelection) {
      e.preventDefault();
      onToggleSelection();
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all duration-300 ease-out",
        isSelectionMode
          ? "cursor-pointer"
          : "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => !isSelectionMode && setShowActions(true)}
      onMouseLeave={() => !dialogOpen && setShowActions(false)}
    >
      {/* Screenshot Hero */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : bookmark.content?.imageUrl ? (
          <img
            src={bookmark.content.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {/* Elegant placeholder with subtle pattern */}
            <div className="relative">
              <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
              <svg
                className="relative h-12 w-12 text-muted-foreground/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Selection checkbox (top left) */}
        {isSelectionMode && (
          <div className="absolute left-3 top-3 z-20">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md border-2 bg-background shadow-sm transition-all",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 hover:border-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection?.();
              }}
            >
              {isSelected && (
                <svg
                  className="h-4 w-4 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* QuickActions (bottom right, appears on hover in normal mode) */}
        {/* Keep mounted when dialog is open to prevent interrupting async operations */}
        {!isSelectionMode && (showActions || dialogOpen) && (
          <div className={cn(
            "absolute bottom-3 right-3 z-20 animate-in fade-in-0 zoom-in-95 duration-200",
            dialogOpen && !showActions && "opacity-0 pointer-events-none"
          )}>
            <QuickActions
              bookmark={bookmark}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              onDialogOpenChange={setDialogOpen}
            />
          </div>
        )}

        {/* Top right indicators */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* AI Processing indicator */}
          <AIStatusBadge
            summarizationStatus={bookmark.summarizationStatus}
            taggingStatus={bookmark.taggingStatus}
            variant="compact"
          />

          {/* Favourited indicator */}
          {bookmark.favourited && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur-sm">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
          )}
          {/* Detail page link */}
          <Link
            href={`/bookmark/${bookmark.id}`}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all hover:text-foreground group-hover:opacity-100"
            title="View details"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h2 className="font-display text-lg font-medium leading-snug text-card-foreground transition-colors duration-200 group-hover:text-primary">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h2>

        {/* Summary - AI generated, shown prominently */}
        {bookmark.summary && (
          <p
            className={`mt-2.5 text-[15px] leading-relaxed text-muted-foreground ${
              expandSummary ? "" : "line-clamp-4"
            }`}
          >
            {bookmark.summary}
          </p>
        )}

        {/* Tags with AI/Human distinction */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {allTags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className={`relative z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                  tag.attachedBy === "human"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
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
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                  </svg>
                )}
                {tag.name}
              </span>
            ))}
            {allTags.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 text-[11px] text-muted-foreground">
                +{allTags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Spacer to push metadata to bottom */}
        <div className="flex-1" />

        {/* Metadata footer */}
        <div className="mt-4 flex items-center gap-2.5 border-t border-border/50 pt-4">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="h-4 w-4 rounded-sm grayscale-[30%] transition-all group-hover:grayscale-0"
            />
          )}
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            {formattedDate}
          </span>
          {bookmark.source && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                {bookmark.source}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Compact variant for denser layouts
 */
export function BookmarkCardCompact({ bookmark }: { bookmark: Bookmark }) {
  const screenshotUrl = getBookmarkScreenshotUrl(bookmark);
  const title = getBookmarkTitle(bookmark);
  const url = bookmark.content?.url;
  const favicon = bookmark.content?.favicon;
  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group relative flex gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/80">
      {/* Small thumbnail */}
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : bookmark.content?.imageUrl ? (
          <img
            src={bookmark.content.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-6 w-6 text-muted-foreground/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-card-foreground transition-colors group-hover:text-primary">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {bookmark.summary && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {bookmark.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {favicon && <img src={favicon} alt="" className="h-3 w-3" />}
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
}
