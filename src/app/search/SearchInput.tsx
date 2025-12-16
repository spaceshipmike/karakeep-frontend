"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchInputProps {
  initialQuery?: string;
}

/**
 * SearchInput - Client-side search input with debounced URL updates
 *
 * Updates the URL query parameter as the user types,
 * with debouncing to avoid excessive navigation.
 */
export function SearchInput({ initialQuery = "" }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with URL when searchParams change
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // Debounced navigation
  const updateUrl = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          scroll: false,
        });
      } else {
        router.push("/search", { scroll: false });
      }
    },
    [router]
  );

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only update URL if query changed from initial
      if (query !== initialQuery) {
        updateUrl(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, initialQuery, updateUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div
        className={`relative flex items-center rounded-lg border bg-card transition-all duration-200 ${
          isFocused
            ? "border-primary/50 ring-2 ring-primary/20"
            : "border-border hover:border-border/80"
        }`}
      >
        {/* Search icon */}
        <svg
          className={`absolute left-4 h-5 w-5 transition-colors ${
            isFocused ? "text-primary" : "text-muted-foreground"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="search"
          placeholder="Search by title, content, tags, or URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-12 w-full bg-transparent pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoFocus
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
