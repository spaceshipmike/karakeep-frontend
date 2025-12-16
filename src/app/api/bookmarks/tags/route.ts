/**
 * API route for bookmark tag operations (attach/detach)
 * Wraps MCP server tools for client-side access
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/bookmarks/tags - Attach or detach tags from bookmark
 * Body: { bookmarkId: string, tags: string[], action: "attach" | "detach" }
 */
export async function POST(request: NextRequest) {
  try {
    const { bookmarkId, tags, action } = await request.json();

    if (!bookmarkId || !tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: bookmarkId, tags (array)" },
        { status: 400 }
      );
    }

    if (action !== "attach" && action !== "detach") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'attach' or 'detach'" },
        { status: 400 }
      );
    }

    // Import dynamically to avoid edge runtime issues
    const { call_tool } = await import("@/lib/mcp");

    const toolName =
      action === "attach"
        ? "karakeep-karakeep-attach-tag-to-bookmark"
        : "karakeep-karakeep-detach-tag-from-bookmark";

    const toolArgs =
      action === "attach"
        ? { bookmarkId, tagsToAttach: tags }
        : { bookmarkId, tagsToDetach: tags };

    await call_tool(toolName, toolArgs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to modify tags:", error);
    return NextResponse.json(
      { error: "Failed to modify tags", details: String(error) },
      { status: 500 }
    );
  }
}
