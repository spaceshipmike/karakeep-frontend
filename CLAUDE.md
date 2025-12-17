# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KarakeepFE is a personal bookmark library frontend for the Karakeep bookmark manager. It's "software for one" — a beautiful, browsable interface with an editorial/magazine aesthetic (inspired by aesthete.alephic.ai).

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui primitives
- **Data Fetching:** Server Components with ISR/static generation
- **Fonts:** Distinctive typography (not Inter/Roboto) — Display: Instrument Serif/Fraunces, Body: Söhne/Untitled Sans

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Route Structure (App Router)
```
/                    → Home (featured/recent bookmarks)
/list/[slug]         → List view (e.g., /list/dev, /list/homelab)
/bookmark/[id]       → Single bookmark detail
/search              → Search results
/tags                → Browse by tags
/tag/[name]          → Bookmarks with specific tag
```

### Core Components
- **Layout:** Sidebar (list navigation), Header (search, dark mode toggle), Footer
- **Cards:** BookmarkCard (full), BookmarkCardCompact (dense view)
- **Lists:** BookmarkGrid, BookmarkList
- **Filters:** TagFilter, SourceFilter, SortSelect

## Data Source: Karakeep API
Use this link for API research: https://deepwiki.com/karakeep-app/karakeep
### Environment Variables
```env
KARAKEEP_API_URL=http://localhost:3000
KARAKEEP_API_KEY=your-api-key-here
```

### API Endpoints
- `karakeep-get-lists` — Returns all lists with hierarchy
- `karakeep-search-bookmarks` — Search/paginate bookmarks
- `karakeep-get-bookmark` — Single bookmark by ID

### Asset URLs
Screenshots served from: `{KARAKEEP_API_URL}/api/assets/{assetId}`

### List Structure
18 lists total including top-level (Prompting, Dev, Homelab, etc.), child lists (UI under Dev, Clothing under Shopping), and smart lists (Inbox: `-is:inlist`, Tagless: `-is:tagged`).

## Design Principles

**Do:**
- Editorial/magazine aesthetic with generous whitespace
- Large screenshot previews as the hero element
- Clean typography with subtle hover states
- Show AI-generated summaries prominently

**Don't:**
- Generic dashboard UI
- Purple gradients on white
- Inter/Roboto fonts
- Cookie-cutter card layouts

## Required Skills

**Always invoke these skills when working on this project:**

- **`frontend-design`** — Use for ALL UI component work. This project demands distinctive, editorial design — not generic AI aesthetics. Invoke before building any visual component.

- **`playwright-skill`** — Use for browser testing and validation. Test pages, validate layouts, take screenshots to verify visual quality.

## Build Order (Recommended)

1. Data fetching utilities (Karakeep API client)
2. Type definitions (Bookmark interface)
3. Layout shell with sidebar
4. BookmarkCard component
5. Home page with recent bookmarks
6. List pages with dynamic routing
7. Search functionality

## Key Type: Bookmark

```typescript
interface Bookmark {
  id: string;
  createdAt: string;
  modifiedAt: string;
  title: string | null;
  archived: boolean;
  favourited: boolean;
  note: string | null;
  summary: string | null;  // AI-generated
  source: "rss" | "extension" | "mobile" | "api";
  tags: Array<{ id: string; name: string; attachedBy: "ai" | "human" }>;
  content: {
    type: "link" | "text";
    url: string;
    title: string;
    description: string;
    imageUrl: string | null;
    screenshotAssetId: string | null;
    favicon: string | null;
    author: string | null;
    publisher: string | null;
  };
  assets: Array<{
    id: string;
    assetType: "screenshot" | "bannerImage" | "linkHtmlContent";
    fileName: string | null;
  }>;
}
```
