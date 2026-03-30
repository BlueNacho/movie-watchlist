import { getTrending } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await getTrending();
    return NextResponse.json(results.slice(0, 20));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Trending API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
