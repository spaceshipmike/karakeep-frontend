/**
 * API route for getting lists that a bookmark belongs to
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KARAKEEP_API_URL || "http://localhost:3000";
const API_KEY = process.env.KARAKEEP_API_KEY || "";

/**
 * GET /api/bookmarks/[id]/lists - Get lists containing this bookmark
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookmarkId } = await params;

    const response = await fetch(
      `${API_URL}/api/v1/bookmarks/${bookmarkId}/lists`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch bookmark lists: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch bookmark lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmark lists" },
      { status: 500 }
    );
  }
}
