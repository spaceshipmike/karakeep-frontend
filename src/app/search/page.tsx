import { Suspense } from "react";
import { AppShell } from "@/components/layout";
import { PaginatedBookmarkGrid } from "@/components/bookmark";
import { getLists, searchBookmarks } from "@/lib/karakeep";
import { SearchInput } from "./SearchInput";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

/**
 * Smart list query to human-readable name mapping
 */
const smartListNames: Record<string, string> = {
  "-is:inlist": "Inbox",
  "-is:tagged": "Tagless",
  "is:fav": "Favorites",
  "is:archived": "Archive",
};

/**
 * Check if query is a smart list
 */
function isSmartList(query: string): boolean {
  return query in smartListNames;
}

/**
 * Get display title for a search query
 */
function getSearchTitle(query: string): string {
  // Check if this is a known smart list
  if (smartListNames[query]) {
    return smartListNames[query];
  }
  // Otherwise it's a regular search
  if (query) {
    return "Search Results";
  }
  return "Search";
}

/**
 * Get description for a search query
 */
function getSearchDescription(query: string, count: number): string {
  const countText = `${count} bookmark${count !== 1 ? "s" : ""}`;

  if (query === "-is:inlist") {
    return `${countText} not yet organized into a list`;
  }
  if (query === "-is:tagged") {
    return `${countText} without any tags`;
  }
  if (query === "is:fav") {
    return `${countText} marked as favorites`;
  }
  if (query === "is:archived") {
    return `${countText} in your archive`;
  }

  if (query) {
    return `${countText} matching "${query}"`;
  }

  return "Find bookmarks by title, content, tags, or URL";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "" } = await searchParams;

  // Fetch lists and search results in parallel
  const [lists, searchResult] = await Promise.all([
    getLists().catch(() => []),
    query
      ? searchBookmarks(query, { limit: 50, sortOrder: "desc" }).catch(() => ({
          bookmarks: [],
          nextCursor: null,
        }))
      : Promise.resolve({ bookmarks: [], nextCursor: null }),
  ]);

  const { bookmarks, nextCursor } = searchResult;
  const title = getSearchTitle(query);
  const description = getSearchDescription(query, bookmarks.length);
  const showSearchInput = !isSmartList(query);

  return (
    <AppShell lists={lists}>
      {/* Page header */}
      <header className="mb-12">
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>

        {/* Search input for regular searches */}
        {showSearchInput && (
          <Suspense fallback={null}>
            <SearchInput initialQuery={query} />
          </Suspense>
        )}
      </header>

      {/* Results grid with pagination */}
      <PaginatedBookmarkGrid
        initialBookmarks={bookmarks}
        initialCursor={nextCursor}
        query={query}
        emptyTitle={query ? "No results" : "Start searching"}
        emptyMessage={
          query
            ? `No bookmarks found matching "${query}".`
            : "Enter a search query above to find bookmarks."
        }
      />
    </AppShell>
  );
}
