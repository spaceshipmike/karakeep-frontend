import Link from "next/link";
import { AppShell } from "@/components/layout";
import { getLists, getRecentBookmarks } from "@/lib/karakeep";
import type { Bookmark } from "@/types";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

interface TagInfo {
  name: string;
  count: number;
  aiCount: number;
  humanCount: number;
}

/**
 * Extract and aggregate tags from bookmarks
 */
function extractTags(bookmarks: Bookmark[]): TagInfo[] {
  const tagMap = new Map<string, { count: number; ai: number; human: number }>();

  bookmarks.forEach((bookmark) => {
    bookmark.tags?.forEach((tag) => {
      const existing = tagMap.get(tag.name) || { count: 0, ai: 0, human: 0 };
      existing.count++;
      if (tag.attachedBy === "ai") {
        existing.ai++;
      } else {
        existing.human++;
      }
      tagMap.set(tag.name, existing);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, data]): TagInfo => ({
      name,
      count: data.count,
      aiCount: data.ai,
      humanCount: data.human,
    }))
    .sort((a, b) => b.count - a.count);
}

export default async function TagsPage() {
  // Fetch all bookmarks to extract tags (use same limit as home page to test)
  const [lists, bookmarks] = await Promise.all([
    getLists().catch(() => []),
    getRecentBookmarks(100).catch(() => []),
  ]);

  const tags = extractTags(bookmarks);

  return (
    <AppShell lists={lists}>
      {/* Page header */}
      <header className="mb-12">
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Tags
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {tags.length} tags across your bookmarks
        </p>
      </header>

      {/* Tags cloud */}
      {tags.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="font-display text-xl font-medium text-card-foreground">
            No tags yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Tags will appear here as you add them to bookmarks.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tag cloud visualization */}
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              // Scale font size based on count (min 12px, max 28px)
              const maxCount = tags[0]?.count || 1;
              const scale = Math.max(0.5, Math.min(1.5, tag.count / maxCount + 0.5));
              const fontSize = 12 + (scale - 0.5) * 16;

              return (
                <Link
                  key={tag.name}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className="group inline-flex items-baseline gap-1.5 rounded-md border border-transparent px-3 py-1.5 transition-colors hover:border-border hover:bg-card"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <span className="text-foreground group-hover:text-primary">
                    {tag.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {tag.count}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Tag list for detailed view */}
          <div className="border-t border-border pt-8">
            <div className="mb-6">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                All Tags
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse tags by source. <span className="font-medium">AI</span> indicates auto-tagged, <span className="font-medium">Manual</span> indicates manually added.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className="group flex items-center justify-between rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-card/80"
                >
                  <span className="text-sm text-card-foreground group-hover:text-primary">
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {/* Show breakdown only if mixed AI + human */}
                    {tag.aiCount > 0 && tag.humanCount > 0 ? (
                      <>
                        <span title="AI-tagged" className="text-muted-foreground/60">
                          {tag.aiCount} AI
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span title="Manually tagged" className="text-muted-foreground/60">
                          {tag.humanCount} manual
                        </span>
                      </>
                    ) : tag.aiCount > 0 ? (
                      <span title="All AI-tagged" className="text-muted-foreground/60">
                        AI
                      </span>
                    ) : tag.humanCount > 0 ? (
                      <span title="All manually tagged" className="text-muted-foreground/60">
                        manual
                      </span>
                    ) : null}
                    <span className="font-mono font-medium text-muted-foreground" title="Total bookmarks">
                      {tag.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
