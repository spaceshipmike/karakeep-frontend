// Karakeep API Type Definitions

/**
 * Tag attached to a bookmark, either by AI or human
 */
export interface Tag {
  id: string;
  name: string;
  attachedBy: "ai" | "human";
}

/**
 * Asset associated with a bookmark (screenshot, banner, or HTML content)
 */
export interface Asset {
  id: string;
  assetType: "screenshot" | "bannerImage" | "linkHtmlContent";
  fileName: string | null;
}

/**
 * Content metadata for a bookmark (link or text content)
 */
export interface BookmarkContent {
  type: "link" | "text";
  url: string;
  title: string;
  description: string;
  imageUrl: string | null;
  screenshotAssetId: string | null;
  favicon: string | null;
  author: string | null;
  publisher: string | null;
}

/**
 * Source of a bookmark (how it was added)
 */
export type BookmarkSource = "rss" | "extension" | "mobile" | "api";

/**
 * A saved bookmark with all metadata
 */
export interface Bookmark {
  id: string;
  createdAt: string;
  modifiedAt: string;
  title: string | null;
  archived: boolean;
  favourited: boolean;
  note: string | null;
  summary: string | null;
  source: BookmarkSource;
  tags: Tag[];
  content: BookmarkContent;
  assets: Asset[];
}

/**
 * A list (collection) of bookmarks
 */
export interface List {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  query: string | null; // For smart lists (e.g., "-is:inlist")
  children?: List[];
}

/**
 * API response for listing bookmarks
 */
export interface BookmarkSearchResponse {
  bookmarks: Bookmark[];
  nextCursor: string | null;
}

/**
 * API response for listing all lists
 */
export interface ListsResponse {
  lists: List[];
}

/**
 * Helper function to get asset URL from Karakeep
 */
export function getAssetUrl(assetId: string, baseUrl: string): string {
  return `${baseUrl}/api/assets/${assetId}`;
}

/**
 * Helper to get the screenshot URL for a bookmark
 */
export function getBookmarkScreenshotUrl(
  bookmark: Bookmark,
  baseUrl: string
): string | null {
  const screenshotAsset = bookmark.assets.find(
    (a) => a.assetType === "screenshot"
  );
  if (screenshotAsset) {
    return getAssetUrl(screenshotAsset.id, baseUrl);
  }
  if (bookmark.content.screenshotAssetId) {
    return getAssetUrl(bookmark.content.screenshotAssetId, baseUrl);
  }
  return null;
}

/**
 * Helper to get display title for a bookmark
 */
export function getBookmarkTitle(bookmark: Bookmark): string {
  return bookmark.title || bookmark.content.title || "Untitled";
}
