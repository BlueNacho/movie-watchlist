import { discover } from "@/lib/tmdb";
import { cacheGet, cacheSet, TMDB_TTL } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cacheKey = `discover:${searchParams.toString()}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await discover({
      genre: searchParams.get("genre") || undefined,
      year: searchParams.get("year") || undefined,
      sort: searchParams.get("sort") || undefined,
      type: (searchParams.get("type") as "movie" | "tv") || undefined,
      ratingMin: searchParams.get("ratingMin") || undefined,
      provider: searchParams.get("provider") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
    });
    cacheSet(cacheKey, data, TMDB_TTL, ["tmdb"]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
