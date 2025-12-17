/**
 * Karakeep API Client
 *
 * Data fetching utilities for the Karakeep bookmark manager API.
 */

import type {
  Bookmark,
  List,
  BookmarkSearchResponse,
  ListsResponse,
} from "@/types";

const API_URL = process.env.KARAKEEP_API_URL || "http://localhost:3000";
const API_KEY = process.env.KARAKEEP_API_KEY || "";

/**
 * Base fetch function with authentication
 */
async function karakeepFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Karakeep API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get all lists with hierarchy (server-side)
 */
export async function getLists(): Promise<List[]> {
  const data = await karakeepFetch<ListsResponse>("/lists");
  return data.lists;
}

/**
 * Get all lists with hierarchy (client-side)
 * Fetches through Next.js API route to avoid exposing credentials
 */
export async function getListsClient(): Promise<List[]> {
  const response = await fetch("/api/lists");
  if (!response.ok) {
    throw new Error(`Failed to fetch lists: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lists;
}

/**
 * Get lists that a bookmark belongs to (client-side)
 */
export async function getBookmarkListsClient(bookmarkId: string): Promise<{ lists: Array<{ id: string; name: string }> }> {
  const response = await fetch(`/api/bookmarks/${bookmarkId}/lists`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmark lists: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Search and paginate bookmarks
 */
export async function searchBookmarks(
  query: string = "",
  options: {
    limit?: number;
    cursor?: string;
    sortOrder?: "asc" | "desc" | "relevance";
    includeContent?: boolean;
  } = {}
): Promise<BookmarkSearchResponse> {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }
  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  if (options.cursor) {
    params.set("cursor", options.cursor);
  }
  if (options.sortOrder) {
    params.set("sortOrder", options.sortOrder);
  }
  if (options.includeContent !== undefined) {
    params.set("includeContent", String(options.includeContent));
  }

  const endpoint = query
    ? `/bookmarks/search?${params.toString()}`
    : `/bookmarks?${params.toString()}`;

  return karakeepFetch<BookmarkSearchResponse>(endpoint);
}

/**
 * Get bookmarks for a specific list
 */
export async function getBookmarksByList(
  listId: string,
  options: {
    limit?: number;
    cursor?: string;
    sortOrder?: "asc" | "desc";
    includeContent?: boolean;
  } = {}
): Promise<BookmarkSearchResponse> {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  if (options.cursor) {
    params.set("cursor", options.cursor);
  }
  if (options.sortOrder) {
    params.set("sortOrder", options.sortOrder);
  }
  if (options.includeContent !== undefined) {
    params.set("includeContent", String(options.includeContent));
  }

  return karakeepFetch<BookmarkSearchResponse>(
    `/lists/${listId}/bookmarks?${params.toString()}`
  );
}

/**
 * Get a single bookmark by ID
 */
export async function getBookmark(
  bookmarkId: string,
  includeContent: boolean = true
): Promise<Bookmark> {
  const params = new URLSearchParams();
  params.set("includeContent", String(includeContent));

  return karakeepFetch<Bookmark>(`/bookmarks/${bookmarkId}?${params.toString()}`);
}

/**
 * Construct asset URL for screenshots and images
 * Uses local proxy route to handle auth (Karakeep may be behind PocketID)
 */
export function getAssetUrl(assetId: string): string {
  return `/api/assets/${assetId}`;
}

/**
 * Get the screenshot URL for a bookmark
 * Checks assets array first, then falls back to screenshotAssetId
 */
export function getBookmarkScreenshotUrl(bookmark: Bookmark): string | null {
  // First check assets array for screenshot
  const screenshotAsset = bookmark.assets?.find(
    (a) => a.assetType === "screenshot"
  );
  if (screenshotAsset) {
    return getAssetUrl(screenshotAsset.id);
  }

  // Fall back to content.screenshotAssetId
  if (bookmark.content?.screenshotAssetId) {
    return getAssetUrl(bookmark.content.screenshotAssetId);
  }

  return null;
}

/**
 * Get the display title for a bookmark
 */
export function getBookmarkTitle(bookmark: Bookmark): string {
  return bookmark.title || bookmark.content?.title || "Untitled";
}

/**
 * Get recent bookmarks (sorted by creation date, descending)
 */
export async function getRecentBookmarks(
  limit: number = 20
): Promise<Bookmark[]> {
  const response = await searchBookmarks("", {
    limit,
    sortOrder: "desc",
    includeContent: true,
  });
  return response.bookmarks;
}

/**
 * Get favorited bookmarks
 */
export async function getFavoritedBookmarks(
  limit: number = 20
): Promise<Bookmark[]> {
  const response = await searchBookmarks("is:fav", {
    limit,
    sortOrder: "desc",
    includeContent: true,
  });
  return response.bookmarks;
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Update bookmark properties (title, note, archived, favourited) - server-side
 */
export async function updateBookmark(
  bookmarkId: string,
  updates: {
    title?: string;
    note?: string;
    archived?: boolean;
    favourited?: boolean;
  }
): Promise<Bookmark> {
  return karakeepFetch<Bookmark>(`/bookmarks/${bookmarkId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

/**
 * Update bookmark properties (title, note, archived, favourited) - client-side
 * Calls through Next.js API route to keep credentials secure
 */
export async function updateBookmarkClient(
  bookmarkId: string,
  updates: {
    title?: string;
    note?: string;
    archived?: boolean;
    favourited?: boolean;
  }
): Promise<Bookmark> {
  const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to update bookmark: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a bookmark (server-side)
 */
export async function deleteBookmark(bookmarkId: string): Promise<void> {
  await karakeepFetch(`/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
}

/**
 * Delete a bookmark (client-side)
 * Calls through Next.js API route to keep credentials secure
 */
export async function deleteBookmarkClient(bookmarkId: string): Promise<void> {
  const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete bookmark: ${response.statusText}`);
  }
}

/**
 * Attach tags to a bookmark (uses MCP server internally)
 * Note: This should be called from a Next.js API route that has access to MCP tools
 */
export async function addTagsToBookmark(
  bookmarkId: string,
  tags: string[]
): Promise<void> {
  // This will be called from Next.js API route that wraps the MCP tool
  // karakeep-attach-tag-to-bookmark
  const response = await fetch("/api/bookmarks/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarkId, tags, action: "attach" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to attach tags: ${response.statusText}`);
  }
}

/**
 * Detach tags from a bookmark (uses MCP server internally)
 * Note: This should be called from a Next.js API route that has access to MCP tools
 */
export async function removeTagsFromBookmark(
  bookmarkId: string,
  tags: string[]
): Promise<void> {
  // This will be called from Next.js API route that wraps the MCP tool
  // karakeep-detach-tag-from-bookmark
  const response = await fetch("/api/bookmarks/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarkId, tags, action: "detach" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to detach tags: ${response.statusText}`);
  }
}

/**
 * Add bookmark to a list (uses MCP server internally)
 * Note: This should be called from a Next.js API route that has access to MCP tools
 */
export async function addBookmarkToList(
  bookmarkId: string,
  listId: string
): Promise<void> {
  // This will be called from Next.js API route that wraps the MCP tool
  // karakeep-add-bookmark-to-list
  const response = await fetch("/api/bookmarks/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarkId, listId, action: "add" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add bookmark to list: ${response.statusText}`);
  }
}

/**
 * Remove bookmark from a list (uses MCP server internally)
 * Note: This should be called from a Next.js API route that has access to MCP tools
 */
export async function removeBookmarkFromList(
  bookmarkId: string,
  listId: string
): Promise<void> {
  // This will be called from Next.js API route that wraps the MCP tool
  // karakeep-remove-bookmark-from-list
  const response = await fetch("/api/bookmarks/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarkId, listId, action: "remove" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark from list: ${response.statusText}`);
  }
}
