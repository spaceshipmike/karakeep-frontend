/**
 * API route for bookmark mutations (update, delete)
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KARAKEEP_API_URL || "http://localhost:3000";
const API_KEY = process.env.KARAKEEP_API_KEY || "";

/**
 * PATCH /api/bookmarks/[id] - Update bookmark properties
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookmarkId } = await params;
    const updates = await request.json();

    // Forward to Karakeep API
    const response = await fetch(
      `${API_URL}/api/v1/bookmarks/${bookmarkId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to update bookmark: ${response.statusText}`, details: error },
        { status: response.status }
      );
    }

    const bookmark = await response.json();
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("Failed to update bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookmarks/[id] - Delete bookmark
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookmarkId } = await params;

    // Forward to Karakeep API
    const response = await fetch(
      `${API_URL}/api/v1/bookmarks/${bookmarkId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to delete bookmark: ${response.statusText}`, details: error },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
