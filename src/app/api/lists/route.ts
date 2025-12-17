import { NextResponse } from "next/server";
import { getLists } from "@/lib/karakeep";

/**
 * GET /api/lists - Fetch all Karakeep lists
 *
 * Server-side API route to fetch lists while keeping API credentials secure.
 */
export async function GET() {
  try {
    const lists = await getLists();
    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Failed to fetch lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}
