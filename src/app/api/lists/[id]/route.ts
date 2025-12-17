import { NextRequest, NextResponse } from "next/server";
import { updateList, deleteList } from "@/lib/karakeep";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/lists/[id] - Update a list
 *
 * Optional fields: name, icon, description, parentId
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate name length if provided
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.length < 1 || body.name.length > 40) {
        return NextResponse.json(
          { error: "Name must be between 1 and 40 characters" },
          { status: 400 }
        );
      }
    }

    // Validate icon if provided
    if (body.icon !== undefined && typeof body.icon !== "string") {
      return NextResponse.json(
        { error: "Icon must be a string" },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description !== undefined && body.description.length > 100) {
      return NextResponse.json(
        { error: "Description must be at most 100 characters" },
        { status: 400 }
      );
    }

    const list = await updateList(id, {
      name: body.name,
      icon: body.icon,
      description: body.description,
      parentId: body.parentId,
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to update list:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id] - Delete a list
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteList(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete list:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete list" },
      { status: 500 }
    );
  }
}
