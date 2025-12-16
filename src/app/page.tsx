export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-16">
          <h1 className="font-display text-5xl font-medium tracking-tight text-foreground">
            Karakeep
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A beautiful bookmark library
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-medium text-card-foreground">
            Getting Started
          </h2>
          <p className="mt-3 text-muted-foreground">
            Project initialized. Next steps:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Create TypeScript type definitions
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Build Karakeep API client
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Create layout with sidebar
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Build BookmarkCard component
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
