"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { List } from "@/types";

interface SidebarProps {
  lists: List[];
  className?: string;
}

// Icon mapping for lists - matches the PROJECT.md emoji definitions
const listIcons: Record<string, string> = {
  Prompting: "chat",
  Obsidian: "circle",
  Shopping: "credit-card",
  Clothing: "shirt",
  Dev: "code",
  UI: "monitor",
  "Dev Setup": "terminal",
  Work: "building",
  Personal: "user",
  Home: "home",
  Projects: "folder",
  "3d Printing": "box",
  CCChorus: "music",
  MCP: "bot",
  Mac: "apple",
  Homelab: "server",
  Inbox: "inbox",
  Tagless: "tag",
};

function getListIcon(name: string): string {
  return listIcons[name] || "bookmark";
}

// Simple SVG icons to avoid external dependencies
function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    chat: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
    circle: <circle cx="12" cy="12" r="8" />,
    "credit-card": (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    ),
    shirt: (
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
    ),
    code: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
    monitor: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </>
    ),
    terminal: (
      <>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 10-16 0" />
      </>
    ),
    home: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    folder: (
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    ),
    box: (
      <>
        <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
    bot: (
      <>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
      </>
    ),
    apple: (
      <path d="M12 2C9.5 2 8 3.5 8 3.5S6.5 2 4 2c-3 0-4 3-4 5 0 4 6 10 12 15 6-5 12-11 12-15 0-2-1-5-4-5-2.5 0-4 1.5-4 1.5S14.5 2 12 2z" />
    ),
    server: (
      <>
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </>
    ),
    inbox: (
      <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </>
    ),
    tag: (
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
    ),
    bookmark: (
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    menu: (
      <>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || icons.bookmark}
    </svg>
  );
}

function ListItem({
  list,
  isActive,
  depth = 0,
}: {
  list: List;
  isActive: boolean;
  depth?: number;
}) {
  const href = list.query ? `/search?q=${encodeURIComponent(list.query)}` : `/list/${list.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/80",
        depth > 0 && "ml-4"
      )}
    >
      <Icon
        name={getListIcon(list.name)}
        className={cn(
          "shrink-0 transition-colors",
          isActive
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
        )}
      />
      <span className="truncate">{list.name}</span>
    </Link>
  );
}

export function Sidebar({ lists, className }: SidebarProps) {
  const pathname = usePathname();

  // Organize lists into top-level and children
  const topLevelLists = lists.filter((l) => !l.parentId);
  const childrenByParent = lists.reduce(
    (acc, list) => {
      if (list.parentId) {
        if (!acc[list.parentId]) acc[list.parentId] = [];
        acc[list.parentId].push(list);
      }
      return acc;
    },
    {} as Record<string, List[]>
  );

  // Separate smart lists (have query) from regular lists
  const smartLists = topLevelLists.filter((l) => l.query);
  const regularLists = topLevelLists.filter((l) => !l.query);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="font-display text-xl font-medium tracking-tight text-sidebar-foreground">
            Karakeep
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Smart Lists Section */}
        {smartLists.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
              Smart Lists
            </h2>
            <div className="space-y-0.5">
              {smartLists.map((list) => (
                <ListItem
                  key={list.id}
                  list={list}
                  isActive={pathname === `/list/${list.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Lists Section */}
        <div>
          <h2 className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
            Collections
          </h2>
          <div className="space-y-0.5">
            {regularLists.map((list) => (
              <div key={list.id}>
                <ListItem
                  list={list}
                  isActive={pathname === `/list/${list.id}`}
                />
                {/* Render children if any */}
                {childrenByParent[list.id]?.map((child) => (
                  <ListItem
                    key={child.id}
                    list={child}
                    isActive={pathname === `/list/${child.id}`}
                    depth={1}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/30">
          {lists.length} lists
        </p>
      </div>
    </aside>
  );
}

export { Icon };
