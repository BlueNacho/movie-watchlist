import { searchMultiPaged } from "@/lib/tmdb";
import { cacheGet, cacheSet, TMDB_TTL } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  if (!query.trim()) {
    return NextResponse.json({ results: [], totalPages: 0 });
  }

  const cacheKey = `search:${query.toLowerCase()}:${page}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await searchMultiPaged(query, page);
    cacheSet(cacheKey, data, TMDB_TTL, ["tmdb"]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
