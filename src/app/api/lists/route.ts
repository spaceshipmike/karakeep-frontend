import { NextRequest, NextResponse } from "next/server";
import { getLists, createList } from "@/lib/karakeep";

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

/**
 * POST /api/lists - Create a new list
 *
 * Required fields: name, icon
 * Optional fields: description, type, query, parentId
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }
    if (!body.icon || typeof body.icon !== "string") {
      return NextResponse.json(
        { error: "Icon is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length < 1 || body.name.length > 40) {
      return NextResponse.json(
        { error: "Name must be between 1 and 40 characters" },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description && body.description.length > 100) {
      return NextResponse.json(
        { error: "Description must be at most 100 characters" },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (body.type && !["manual", "smart"].includes(body.type)) {
      return NextResponse.json(
        { error: "Type must be 'manual' or 'smart'" },
        { status: 400 }
      );
    }

    // Smart lists require a query
    if (body.type === "smart" && !body.query) {
      return NextResponse.json(
        { error: "Smart lists require a query" },
        { status: 400 }
      );
    }

    const list = await createList({
      name: body.name,
      icon: body.icon,
      description: body.description,
      type: body.type || "manual",
      query: body.query,
      parentId: body.parentId,
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error("Failed to create list:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create list" },
      { status: 500 }
    );
  }
}
