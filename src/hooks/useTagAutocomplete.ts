"use client";

import { useState, useEffect, useCallback } from "react";

export interface Tag {
  id: string;
  name: string;
  numBookmarks?: number;
}

/**
 * useTagAutocomplete - Debounced tag search with autocomplete
 *
 * Fetches available tags from server with debouncing to avoid
 * excessive API calls during typing.
 */
export function useTagAutocomplete(debounceMs: number = 300) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        // Fetch tags from Karakeep API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tags?q=${encodeURIComponent(query)}`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to fetch tag suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [query, debounceMs]);

  const clear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    clear,
  };
}
