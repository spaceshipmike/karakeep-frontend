/**
 * API route for client-side bookmark fetching (pagination)
 */

import { NextRequest, NextResponse } from "next/server";
import { searchBookmarks, getBookmarksByList } from "@/lib/karakeep";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const listId = searchParams.get("listId");
  const query = searchParams.get("q") || "";

  try {
    let result;

    if (listId) {
      // Fetch bookmarks for a specific list
      result = await getBookmarksByList(listId, {
        cursor,
        limit,
        sortOrder: "desc",
      });
    } else {
      // Search or fetch all bookmarks
      result = await searchBookmarks(query, {
        cursor,
        limit,
        sortOrder: "desc",
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
