/**
 * API route for bookmark list operations (add/remove)
 * Wraps MCP server tools for client-side access
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/bookmarks/lists - Add or remove bookmark from list
 * Body: { bookmarkId: string, listId: string, action: "add" | "remove" }
 */
export async function POST(request: NextRequest) {
  try {
    const { bookmarkId, listId, action } = await request.json();

    if (!bookmarkId || !listId) {
      return NextResponse.json(
        { error: "Missing required fields: bookmarkId, listId" },
        { status: 400 }
      );
    }

    if (action !== "add" && action !== "remove") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    // Import dynamically to avoid edge runtime issues
    const { call_tool } = await import("@/lib/mcp");

    const toolName =
      action === "add"
        ? "karakeep-karakeep-add-bookmark-to-list"
        : "karakeep-karakeep-remove-bookmark-from-list";

    await call_tool(toolName, { bookmarkId, listId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to modify list membership:", error);
    return NextResponse.json(
      { error: "Failed to modify list membership", details: String(error) },
      { status: 500 }
    );
  }
}
