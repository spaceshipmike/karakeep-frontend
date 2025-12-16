import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout";
import {
  getLists,
  getBookmark,
  getBookmarkScreenshotUrl,
  getBookmarkTitle,
} from "@/lib/karakeep";

interface BookmarkPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookmarkPage({ params }: BookmarkPageProps) {
  const { id } = await params;

  const [lists, bookmark] = await Promise.all([
    getLists().catch(() => []),
    getBookmark(id, true).catch(() => null),
  ]);

  if (!bookmark) {
    notFound();
  }

  const title = getBookmarkTitle(bookmark);
  const screenshotUrl = getBookmarkScreenshotUrl(bookmark);
  const { content } = bookmark;

  // Format date
  const createdDate = new Date(bookmark.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell lists={lists}>
      <article className="mx-auto max-w-4xl">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to library
          </Link>
        </div>

        {/* Screenshot hero */}
        {screenshotUrl && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={screenshotUrl}
              alt={title}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {content?.publisher && (
              <span className="flex items-center gap-1.5">
                {content.favicon && (
                  <img
                    src={content.favicon}
                    alt=""
                    width={16}
                    height={16}
                    className="rounded"
                  />
                )}
                {content.publisher}
              </span>
            )}
            {content?.author && <span>by {content.author}</span>}
            <span>{createdDate}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {bookmark.source}
            </span>
          </div>

          {/* URL */}
          {content?.url && (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block truncate font-mono text-sm text-primary hover:underline"
            >
              {content.url}
            </a>
          )}
        </header>

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted/80"
                >
                  <span>{tag.name}</span>
                  {tag.attachedBy === "ai" && (
                    <span className="text-[9px] text-muted-foreground/50">AI</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {bookmark.summary && (
          <section className="mb-8">
            <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              AI Summary
            </h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="whitespace-pre-wrap text-card-foreground leading-relaxed">
                {bookmark.summary}
              </p>
            </div>
          </section>
        )}

        {/* User Notes */}
        {bookmark.note && (
          <section className="mb-8">
            <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Your Notes
            </h2>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {bookmark.note}
              </p>
            </div>
          </section>
        )}

        {/* Description */}
        {content?.description && (
          <section className="mb-8">
            <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </section>
        )}

        {/* Metadata */}
        <section className="border-t border-border pt-8">
          <h2 className="mb-4 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Details
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="text-foreground">{createdDate}</dd>
            </div>
            {bookmark.modifiedAt !== bookmark.createdAt && (
              <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-muted-foreground">Modified</dt>
                <dd className="text-foreground">
                  {new Date(bookmark.modifiedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="font-mono text-foreground">{bookmark.source}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Content Type</dt>
              <dd className="font-mono text-foreground">{content?.type || "unknown"}</dd>
            </div>
            {bookmark.favourited && (
              <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-foreground">Favourited</dd>
              </div>
            )}
            {bookmark.archived && (
              <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-foreground">Archived</dd>
              </div>
            )}
          </dl>
        </section>
      </article>
    </AppShell>
  );
}
