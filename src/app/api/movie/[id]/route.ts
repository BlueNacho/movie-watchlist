import { getDetail, getWatchProviders } from "@/lib/tmdb";
import { cacheGet, cacheSet, TMDB_TTL } from "@/lib/cache";
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
  const cacheKey = `movie:${mediaType}:${itemId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [detail, providers] = await Promise.all([
      getDetail(itemId, mediaType),
      getWatchProviders(itemId, mediaType),
    ]);

    const data = { ...detail, watch_providers: providers };
    cacheSet(cacheKey, data, TMDB_TTL, ["tmdb"]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
