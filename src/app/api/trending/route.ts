import { getTrending } from "@/lib/tmdb";
import { cacheGet, cacheSet, TMDB_TTL } from "@/lib/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const cacheKey = "trending";
  const cached = cacheGet<{ results: unknown[]; totalPages: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const results = await getTrending();
    const data = { results: results.slice(0, 20), totalPages: 1 };
    cacheSet(cacheKey, data, TMDB_TTL, ["tmdb"]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
