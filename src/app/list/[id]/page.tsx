import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PaginatedBookmarkGrid } from "@/components/bookmark";
import { getLists, getBookmarksByList, searchBookmarks } from "@/lib/karakeep";
import type { List } from "@/types";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Find a list by ID, including nested children
 */
function findListById(lists: List[], id: string): List | undefined {
  for (const list of lists) {
    if (list.id === id) return list;
    if (list.children) {
      const found = findListById(list.children, id);
      if (found) return found;
    }
  }
  // Also check flat structure (API may return flat with parentId)
  return lists.find((l) => l.id === id);
}

/**
 * Find parent list for breadcrumb display
 */
function findParentList(lists: List[], parentId: string | null): List | undefined {
  if (!parentId) return undefined;
  return lists.find((l) => l.id === parentId);
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params;

  // First fetch lists to find the current list and check if it's a smart list
  const lists = await getLists().catch(() => []);
  const currentList = findListById(lists, id);

  if (!currentList) {
    notFound();
  }

  // Smart lists use query-based search, regular lists use direct list endpoint
  const isSmartList = !!currentList.query;

  const bookmarksResult = isSmartList
    ? await searchBookmarks(currentList.query!, { limit: 50, sortOrder: "desc" }).catch(() => ({
        bookmarks: [],
        nextCursor: null,
      }))
    : await getBookmarksByList(id, { limit: 50, sortOrder: "desc" }).catch(() => ({
        bookmarks: [],
        nextCursor: null,
      }));

  const parentList = findParentList(lists, currentList.parentId);
  const { bookmarks, nextCursor } = bookmarksResult;

  return (
    <AppShell lists={lists}>
      {/* Page header with optional breadcrumb */}
      <header className="mb-12">
        {parentList && (
          <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            {parentList.name} /
          </div>
        )}
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {currentList.name}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {bookmarks.length}+ bookmark{bookmarks.length !== 1 ? "s" : ""} in this collection
        </p>
      </header>

      {/* Bookmarks grid with pagination - smart lists use query, regular lists use listId */}
      <PaginatedBookmarkGrid
        initialBookmarks={bookmarks}
        initialCursor={nextCursor}
        listId={isSmartList ? undefined : id}
        query={isSmartList ? currentList.query! : undefined}
        emptyTitle="No bookmarks"
        emptyMessage={`Add bookmarks to "${currentList.name}" to see them here.`}
      />
    </AppShell>
  );
}

/**
 * Generate static params for all known lists
 */
export async function generateStaticParams() {
  try {
    const lists = await getLists();
    return lists.map((list) => ({ id: list.id }));
  } catch {
    return [];
  }
}
