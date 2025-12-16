# Karakeep Frontend

## Vision

An **aesthete.alephic.ai-style** frontend for my personal Karakeep bookmark library. This is "software for one" — a beautiful, browsable interface for my saved links that I'll actually enjoy using.

**Reference site:** https://aesthete.alephic.ai (177 curated design brands, category navigation, rich cards)

---

## Design Direction

### Aesthetic
- **Editorial/magazine** feel — not a typical dashboard
- Clean typography, generous whitespace
- Cards with large screenshot previews
- Subtle hover states and transitions
- Dark mode support

### Inspiration from Aesthete
- Left sidebar with category navigation (lists)
- Main content area with card grid
- Cards show: image, title, description, metadata chips
- Filtering by category/tags
- Search functionality
- Country flags → we'll use favicons or tag chips instead

### What NOT to do
- No generic dashboard UI
- No purple gradients on white
- No Inter/Roboto fonts
- No cookie-cutter card layouts

---

## Data Source: Karakeep MCP Server

### Available Endpoints

```
karakeep-get-lists          → Returns all lists with hierarchy
karakeep-search-bookmarks   → Search/paginate bookmarks
karakeep-get-bookmark       → Single bookmark by ID
```

### List Structure (18 lists)

```yaml
Top-level lists:
  - Prompting (💬)
  - Obsidian (⚫)
  - Shopping (💳)
    - Clothing (🚀) [child]
  - Dev (💻)
    - UI (🖥️) [child]
    - Dev Setup (👨‍💻) [child]
  - Work (🏗️)
  - Personal (👨)
  - Home (🏡)
  - Projects (📽️)
    - 3d Printing (🏗️) [child]
  - CCChorus (🎶)
  - MCP (🤖)
  - Mac (🍏)
  - Homelab (🔬)

Smart lists (auto-populated):
  - Inbox (📥) — query: "-is:inlist"
  - Tagless (🪹) — query: "-is:tagged"
```

### Bookmark Schema

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
  
  tags: Array<{
    id: string;
    name: string;
    attachedBy: "ai" | "human";
  }>;
  
  content: {
    type: "link" | "text";
    url: string;
    title: string;
    description: string;
    imageUrl: string | null;        // OG image
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

### Asset URLs

Screenshots and images are served from Karakeep's asset endpoint:
```
{KARAKEEP_BASE_URL}/api/assets/{assetId}
```

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (for primitives)
- **Data:** 
  - Server components fetch from Karakeep API
  - ISR/static generation where possible
  - Client-side search/filter for interactivity
- **Fonts:** Pick something distinctive (not Inter) — consider:
  - Display: Instrument Serif, Fraunces, or similar
  - Body: Söhne, Untitled Sans, or similar

---

## Environment Variables

```env
KARAKEEP_API_URL=http://localhost:3000  # or your Karakeep instance
KARAKEEP_API_KEY=your-api-key-here      # if auth required
```

---

## Page Structure

```
/                       → Home (featured/recent bookmarks)
/list/[slug]            → List view (e.g., /list/dev, /list/homelab)
/bookmark/[id]          → Single bookmark detail (optional)
/search                 → Search results
/tags                   → Browse by tags
/tag/[name]             → Bookmarks with specific tag
```

---

## Core Components

### Layout
- `Sidebar` — List navigation with icons, collapsible on mobile
- `Header` — Search bar, maybe dark mode toggle
- `Footer` — Minimal

### Cards
- `BookmarkCard` — Screenshot, title, summary excerpt, tags, favicon, date
- `BookmarkCardCompact` — Smaller variant for dense views

### Lists
- `BookmarkGrid` — Responsive grid of cards
- `BookmarkList` — Table/list view option

### Filters
- `TagFilter` — Multi-select tags
- `SourceFilter` — Filter by rss/extension/mobile
- `SortSelect` — Date, title, etc.

---

## Key Features

### Must Have (MVP)
1. List-based navigation sidebar
2. Card grid with screenshots
3. Basic search
4. Tag display on cards
5. Responsive design
6. Link to original URL

### Nice to Have
1. Tag filtering
2. Favourites view
3. Dark mode
4. Keyboard navigation
5. Reading list / "read later" queue
6. Archive view

---

## Sample Data

Here's what a typical bookmark looks like:

```json
{
  "id": "x0ac1l5g9n0eh124pedef6a4",
  "title": "tobi/qmd - mini cli search engine for your docs",
  "summary": "QMD is a local, command‑line search engine that indexes Markdown notes...",
  "tags": [
    {"name": "search engine", "attachedBy": "ai"},
    {"name": "Markdown", "attachedBy": "ai"},
    {"name": "local-search", "attachedBy": "ai"}
  ],
  "content": {
    "url": "https://github.com/tobi/qmd",
    "title": "GitHub - tobi/qmd",
    "favicon": "https://github.com/fluidicon.png",
    "screenshotAssetId": "ef8ef8b4-fc70-4842-887c-3cd6a6dca9da"
  },
  "source": "rss",
  "createdAt": "2025-12-16T07:00:03.000Z"
}
```

---

## Claude Code Instructions

1. **First:** Read `/mnt/skills/public/frontend-design/SKILL.md` for design principles
2. **Then:** Build in this order:
   - Data fetching utilities (Karakeep API client)
   - Type definitions
   - Layout shell with sidebar
   - BookmarkCard component
   - Home page with recent bookmarks
   - List pages with dynamic routing
   - Search functionality
3. **Style:** Follow the Frontend Design skill — make bold aesthetic choices, avoid generic AI-look

---

## Notes

- This is personal software — doesn't need to be perfect or handle edge cases
- Prioritize visual appeal and browsing experience
- Screenshots are the hero — make them prominent
- AI summaries are valuable — show them, don't truncate too aggressively
- Tags are auto-generated by Karakeep's AI — they're useful for filtering
