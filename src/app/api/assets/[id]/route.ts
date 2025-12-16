/**
 * Asset Proxy Route
 *
 * Proxies asset requests to the Karakeep API, adding authentication.
 * This allows the browser to load images without direct access to the
 * Karakeep server (which may be behind auth like PocketID).
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KARAKEEP_API_URL || "http://localhost:3000";
const API_KEY = process.env.KARAKEEP_API_KEY || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse("Asset ID required", { status: 400 });
  }

  try {
    const assetUrl = `${API_URL}/api/assets/${id}`;

    const response = await fetch(assetUrl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      return new NextResponse("Asset not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Asset proxy error:", error);
    return new NextResponse("Failed to fetch asset", { status: 500 });
  }
}
