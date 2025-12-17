"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EditListModal } from "@/components/list/EditListModal";
import { Icon } from "@/components/ui/Icons";
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
  Favorites: "star",
  Archive: "archive",
};

function getListIcon(name: string): string {
  return listIcons[name] || "bookmark";
}

interface ListItemProps {
  list: List;
  isActive: boolean;
  depth?: number;
  onEdit?: (list: List) => void;
  allLists: List[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  pathname: string;
}

function ListItem({
  list,
  isActive,
  depth = 0,
  onEdit,
  allLists,
  expandedIds,
  onToggleExpand,
  pathname,
}: ListItemProps) {
  const href = list.query ? `/search?q=${encodeURIComponent(list.query)}` : `/list/${list.id}`;
  const isEditable = !list.id.startsWith("_") && !list.query; // Not built-in and not smart list

  // Find children of this list
  const children = allLists.filter((l) => l.parentId === list.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(list.id);

  // Calculate indentation - cap at 3 levels (48px)
  const indentLevel = Math.min(depth, 3);
  const marginLeft = depth > 0 ? `${indentLevel * 16}px` : "0";

  return (
    <>
      <div className="group/item relative flex items-center" style={{ marginLeft }}>
        {/* Chevron button for expandable lists */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpand(list.id);
            }}
            className="shrink-0 rounded p-1 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
            title={isExpanded ? "Collapse" : "Expand"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={14} />
          </button>
        )}

        <Link
          href={href}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/80",
            !hasChildren && "ml-7" // Add left margin when no chevron to align with items that have chevrons
          )}
        >
          <Icon
            name={list.icon || getListIcon(list.name)}
            className={cn(
              "shrink-0 transition-colors",
              isActive
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/50 group-hover/item:text-sidebar-foreground/70"
            )}
          />
          <span className="truncate">{list.name}</span>
        </Link>
        {isEditable && onEdit && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(list);
            }}
            className="absolute right-1 rounded p-1 text-sidebar-foreground/30 opacity-0 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover/item:opacity-100"
            title="Edit collection"
            aria-label="Edit collection"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Recursively render children when expanded */}
      {hasChildren && isExpanded && (
        <>
          {children.map((child) => {
            const childIsActive = pathname === `/list/${child.id}`;
            return (
              <ListItem
                key={child.id}
                list={child}
                isActive={childIsActive}
                depth={depth + 1}
                onEdit={onEdit}
                allLists={allLists}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                pathname={pathname}
              />
            );
          })}
        </>
      )}
    </>
  );
}

export function Sidebar({ lists, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQuery = searchParams.get("q") || "";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  // State for expanded/collapsed lists - initialize with all lists expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const hasChildren = (listId: string) => lists.some((l) => l.parentId === listId);
    return new Set(lists.filter((l) => hasChildren(l.id)).map((l) => l.id));
  });

  // Toggle expand/collapse for a list
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Organize lists into top-level only (children are handled recursively by ListItem)
  const topLevelLists = lists.filter((l) => !l.parentId);

  // Separate smart lists (have query) from regular lists
  const apiSmartLists = topLevelLists.filter((l) => l.query);
  const regularLists = topLevelLists.filter((l) => !l.query);

  // Add built-in smart lists that aren't in the API
  const builtInSmartLists: List[] = [
    { id: "_favorites", name: "Favorites", icon: "star", query: "is:fav", parentId: null },
    { id: "_archive", name: "Archive", icon: "archive", query: "is:archived", parentId: null },
  ];
  const smartLists = [...apiSmartLists, ...builtInSmartLists];

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
                  isActive={pathname === "/search" && currentQuery === list.query}
                  allLists={lists}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        )}

        {/* Browse Section */}
        <div className="mb-6">
          <h2 className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
            Browse
          </h2>
          <div className="space-y-0.5">
            <Link
              href="/tags"
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/tags" || pathname.startsWith("/tag/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80"
              )}
            >
              <Icon
                name="tag"
                className={cn(
                  "shrink-0 transition-colors",
                  pathname === "/tags" || pathname.startsWith("/tag/")
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                )}
              />
              <span className="truncate">Tags</span>
            </Link>
          </div>
        </div>

        {/* Regular Lists Section */}
        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
              Collections
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded p-0.5 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="New collection"
              aria-label="Create new collection"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-0.5">
            {regularLists.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                isActive={pathname === `/list/${list.id}`}
                onEdit={setEditingList}
                allLists={lists}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                pathname={pathname}
              />
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

      {/* Create List Modal */}
      <EditListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh the page to show the new list
          router.refresh();
        }}
        allLists={lists}
      />

      {/* Edit List Modal */}
      <EditListModal
        isOpen={!!editingList}
        list={editingList ?? undefined}
        onClose={() => setEditingList(null)}
        onSuccess={() => {
          setEditingList(null);
          router.refresh();
        }}
        allLists={lists}
      />
    </aside>
  );
}
