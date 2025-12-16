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
 * Get all lists with hierarchy
 */
export async function getLists(): Promise<List[]> {
  const data = await karakeepFetch<ListsResponse>("/lists");
  return data.lists;
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
 */
export function getAssetUrl(assetId: string): string {
  return `${API_URL}/api/assets/${assetId}`;
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
