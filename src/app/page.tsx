import { AppShell } from "@/components/layout";
import { BookmarkGrid } from "@/components/bookmark";
import { getLists, getRecentBookmarks } from "@/lib/karakeep";

export default async function Home() {
  // Fetch lists and recent bookmarks
  const [lists, recentBookmarks] = await Promise.all([
    getLists().catch(() => []),
    getRecentBookmarks(12).catch(() => []),
  ]);

  return (
    <AppShell lists={lists}>
      {/* Page header */}
      <header className="mb-12">
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Recent Bookmarks
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Your latest saved links and notes
        </p>
      </header>

      {/* Bookmarks grid */}
      <BookmarkGrid
        bookmarks={recentBookmarks}
        emptyTitle="No bookmarks yet"
        emptyMessage="Your recent bookmarks will appear here once you start saving links."
      />
    </AppShell>
  );
}
