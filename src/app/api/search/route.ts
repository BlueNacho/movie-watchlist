import { searchMultiPaged } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  if (!query.trim()) {
    return NextResponse.json({ results: [], totalPages: 0 });
  }
  try {
    const data = await searchMultiPaged(query, page);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Search API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
