import { db } from "@/db";
import { watchlistItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get all watchlist items for the logged-in user
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const items = await db
    .select()
    .from(watchlistItems)
    .where(eq(watchlistItems.userId, session.userId))
    .orderBy(watchlistItems.addedAt);

  return NextResponse.json(items);
}

// Add item to watchlist
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { tmdbId, mediaType, title, posterPath, overview, voteAverage, genreNames } = body;

  if (!tmdbId || !mediaType || !title) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Check if already in watchlist
  const [existing] = await db
    .select()
    .from(watchlistItems)
    .where(
      and(
        eq(watchlistItems.userId, session.userId),
        eq(watchlistItems.tmdbId, tmdbId),
        eq(watchlistItems.mediaType, mediaType)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Ya esta en tu lista" }, { status: 409 });
  }

  const [item] = await db
    .insert(watchlistItems)
    .values({
      userId: session.userId,
      tmdbId,
      mediaType,
      title,
      posterPath: posterPath || null,
      overview: overview || null,
      voteAverage: voteAverage || null,
      genreNames: genreNames || null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
