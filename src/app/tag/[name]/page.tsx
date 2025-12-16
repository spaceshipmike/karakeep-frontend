import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PaginatedBookmarkGrid } from "@/components/bookmark";
import { getLists, searchBookmarks } from "@/lib/karakeep";

interface TagPageProps {
  params: Promise<{ name: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { name } = await params;
  const tagName = decodeURIComponent(name);

  // Fetch bookmarks with this tag using search query
  const [lists, bookmarksResult] = await Promise.all([
    getLists().catch(() => []),
    searchBookmarks(`#${tagName}`, { limit: 50, sortOrder: "desc" }).catch(() => ({
      bookmarks: [],
      nextCursor: null,
    })),
  ]);

  const { bookmarks, nextCursor } = bookmarksResult;

  return (
    <AppShell lists={lists}>
      {/* Page header with breadcrumb */}
      <header className="mb-12">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
          <Link href="/tags" className="hover:text-muted-foreground">
            Tags
          </Link>
          {" / "}
        </div>
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          #{tagName}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {bookmarks.length}+ bookmark{bookmarks.length !== 1 ? "s" : ""} with this tag
        </p>
      </header>

      {/* Bookmarks grid with pagination */}
      <PaginatedBookmarkGrid
        initialBookmarks={bookmarks}
        initialCursor={nextCursor}
        query={`#${tagName}`}
        showTagFilter={false}
        emptyTitle="No bookmarks"
        emptyMessage={`No bookmarks tagged with "${tagName}" yet.`}
      />
    </AppShell>
  );
}
