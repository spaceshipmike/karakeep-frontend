"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface QueryBuilderProps {
  value: string;
  onChange: (query: string) => void;
  availableTags?: string[];
}

type QueryMode = "visual" | "raw";

interface VisualState {
  isFavorite: boolean;
  isArchived: boolean;
  isUnorganized: boolean;
  isUntagged: boolean;
  selectedTags: string[];
  searchText: string;
}

/**
 * QueryBuilder - Visual and raw query builder for Karakeep search syntax
 *
 * Supports building queries with toggles for is:fav, is:archived, -is:inlist, -is:tagged,
 * tag selection, and text search.
 */
export function QueryBuilder({
  value,
  onChange,
  availableTags = [],
}: QueryBuilderProps) {
  const [mode, setMode] = useState<QueryMode>("visual");
  const [visualState, setVisualState] = useState<VisualState>({
    isFavorite: false,
    isArchived: false,
    isUnorganized: false,
    isUntagged: false,
    selectedTags: [],
    searchText: "",
  });
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Parse query string into visual state when component mounts or value changes externally
  useEffect(() => {
    const parsed = parseQuery(value);
    setVisualState(parsed);
  }, [value]);

  // Generate query string from visual state
  const generatedQuery = useMemo(() => {
    const parts: string[] = [];

    if (visualState.isFavorite) parts.push("is:fav");
    if (visualState.isArchived) parts.push("is:archived");
    if (visualState.isUnorganized) parts.push("-is:inlist");
    if (visualState.isUntagged) parts.push("-is:tagged");

    visualState.selectedTags.forEach((tag) => {
      parts.push(`#${tag}`);
    });

    if (visualState.searchText.trim()) {
      parts.push(`"${visualState.searchText.trim()}"`);
    }

    return parts.join(" ");
  }, [visualState]);

  // Update parent when generated query changes
  useEffect(() => {
    if (mode === "visual") {
      onChange(generatedQuery);
    }
  }, [generatedQuery, mode, onChange]);

  const toggleFlag = (flag: keyof VisualState) => {
    setVisualState((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const toggleTag = (tag: string) => {
    setVisualState((prev) => {
      const isSelected = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: isSelected
          ? prev.selectedTags.filter((t) => t !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  };

  const removeTag = (tag: string) => {
    setVisualState((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.filter((t) => t !== tag),
    }));
  };

  const switchMode = (newMode: QueryMode) => {
    if (newMode === "raw" && mode === "visual") {
      // Switching to raw: use generated query
      setMode(newMode);
    } else if (newMode === "visual" && mode === "raw") {
      // Switching to visual: parse current value
      const parsed = parseQuery(value);
      setVisualState(parsed);
      setMode(newMode);
    }
  };

  const handleRawChange = (rawQuery: string) => {
    onChange(rawQuery);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Query Builder
        </h3>
        <div className="inline-flex rounded-md border border-border bg-background">
          <button
            type="button"
            onClick={() => switchMode("visual")}
            className={cn(
              "px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              mode === "visual"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => switchMode("raw")}
            className={cn(
              "px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              mode === "raw"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Raw
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="space-y-4">
          {/* Toggle Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                label="Favorites"
                active={visualState.isFavorite}
                onClick={() => toggleFlag("isFavorite")}
              />
              <ToggleChip
                label="Archived"
                active={visualState.isArchived}
                onClick={() => toggleFlag("isArchived")}
              />
              <ToggleChip
                label="Unorganized"
                active={visualState.isUnorganized}
                onClick={() => toggleFlag("isUnorganized")}
              />
              <ToggleChip
                label="Untagged"
                active={visualState.isUntagged}
                onClick={() => toggleFlag("isUntagged")}
              />
            </div>
          </div>

          {/* Tag Selector */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Tags
              </label>

              {/* Selected Tags */}
              {visualState.selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visualState.selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-mono text-[11px] text-primary-foreground"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-foreground/70"
                        aria-label={`Remove ${tag}`}
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
                    </div>
                  ))}
                </div>
              )}

              {/* Tag Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {visualState.selectedTags.length > 0
                    ? `${visualState.selectedTags.length} tag${visualState.selectedTags.length > 1 ? "s" : ""} selected`
                    : "Select tags..."}
                </button>

                {showTagDropdown && (
                  <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                    {availableTags.map((tag) => {
                      const isSelected = visualState.selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            toggleTag(tag);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                            isSelected && "bg-muted"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3 text-primary-foreground"
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
                          <span className="font-mono text-xs">#{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Search */}
          <div className="space-y-2">
            <label
              htmlFor="search-text"
              className="block text-xs font-medium text-muted-foreground"
            >
              Text Search
            </label>
            <input
              id="search-text"
              type="text"
              value={visualState.searchText}
              onChange={(e) =>
                setVisualState((prev) => ({
                  ...prev,
                  searchText: e.target.value,
                }))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search in title, content, notes..."
            />
          </div>

          {/* Generated Query Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Generated Query
            </label>
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground">
              {generatedQuery || <span className="text-muted-foreground">No filters set</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Raw Query Input */}
          <div className="space-y-2">
            <label
              htmlFor="raw-query"
              className="block text-xs font-medium text-muted-foreground"
            >
              Query String
            </label>
            <textarea
              id="raw-query"
              value={value}
              onChange={(e) => handleRawChange(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="is:fav -is:archived #productivity"
            />
          </div>

          {/* Syntax Help */}
          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Syntax Reference
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  is:fav
                </code>{" "}
                - Favorites only
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  is:archived
                </code>{" "}
                - Archived items
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  -is:inlist
                </code>{" "}
                - Not in any list (unorganized)
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  -is:tagged
                </code>{" "}
                - Not tagged
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  #tagname
                </code>{" "}
                - Has specific tag
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  "text"
                </code>{" "}
                - Text search
              </li>
              <li className="mt-2 border-t border-border pt-2">
                <span className="text-muted-foreground/80">Example:</span>{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  is:fav -is:archived #productivity
                </code>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ToggleChip - Clickable toggle chip component
 */
function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      <div
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
          active
            ? "border-primary-foreground/30 bg-primary-foreground/20"
            : "border-muted-foreground/30"
        )}
      >
        {active && (
          <svg
            className="h-2.5 w-2.5 text-primary-foreground"
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
      <span>{label}</span>
    </button>
  );
}

/**
 * Parse a Karakeep query string into visual state
 */
function parseQuery(query: string): VisualState {
  const state: VisualState = {
    isFavorite: false,
    isArchived: false,
    isUnorganized: false,
    isUntagged: false,
    selectedTags: [],
    searchText: "",
  };

  if (!query.trim()) return state;

  const tokens = query.match(/(".*?"|\S+)/g) || [];

  tokens.forEach((token) => {
    const normalized = token.trim();

    if (normalized === "is:fav") {
      state.isFavorite = true;
    } else if (normalized === "is:archived") {
      state.isArchived = true;
    } else if (normalized === "-is:inlist") {
      state.isUnorganized = true;
    } else if (normalized === "-is:tagged") {
      state.isUntagged = true;
    } else if (normalized.startsWith("#")) {
      const tag = normalized.slice(1);
      if (tag && !state.selectedTags.includes(tag)) {
        state.selectedTags.push(tag);
      }
    } else if (normalized.startsWith('"') && normalized.endsWith('"')) {
      // Extract text search (remove quotes)
      state.searchText = normalized.slice(1, -1);
    }
  });

  return state;
}
