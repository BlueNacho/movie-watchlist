import { searchMulti } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  if (!query.trim()) {
    return NextResponse.json([]);
  }
  try {
    const results = await searchMulti(query);
    return NextResponse.json(results.slice(0, 20));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Search API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
