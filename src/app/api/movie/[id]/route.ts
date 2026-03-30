import { getDetail, getWatchProviders } from "@/lib/tmdb";
import type { MediaType } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const mediaType = (request.nextUrl.searchParams.get("type") || "movie") as MediaType;

  try {
    const [detail, providers] = await Promise.all([
      getDetail(itemId, mediaType),
      getWatchProviders(itemId, mediaType),
    ]);

    return NextResponse.json({ ...detail, watch_providers: providers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Detail API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
