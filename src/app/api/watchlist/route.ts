import { db } from "@/db";
import { watchlistItems, users, collectionItems, collections } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get all watchlist items with user
  const items = await db
    .select({
      id: watchlistItems.id,
      userId: watchlistItems.userId,
      tmdbId: watchlistItems.tmdbId,
      mediaType: watchlistItems.mediaType,
      title: watchlistItems.title,
      posterPath: watchlistItems.posterPath,
      overview: watchlistItems.overview,
      voteAverage: watchlistItems.voteAverage,
      genreNames: watchlistItems.genreNames,
      releaseYear: watchlistItems.releaseYear,
      status: watchlistItems.status,
      addedAt: watchlistItems.addedAt,
      watchedAt: watchlistItems.watchedAt,
      addedBy: users.username,
    })
    .from(watchlistItems)
    .innerJoin(users, eq(watchlistItems.userId, users.id))
    .orderBy(watchlistItems.addedAt);

  // Get all collection memberships
  const memberships = await db
    .select({
      watchlistItemId: collectionItems.watchlistItemId,
      collectionId: collectionItems.collectionId,
      collectionName: collections.name,
      position: collectionItems.position,
    })
    .from(collectionItems)
    .innerJoin(collections, eq(collectionItems.collectionId, collections.id));

  // Group memberships by watchlist item
  const membershipMap = new Map<number, { collectionId: number; collectionName: string; position: number }[]>();
  for (const m of memberships) {
    const list = membershipMap.get(m.watchlistItemId) || [];
    list.push({ collectionId: m.collectionId, collectionName: m.collectionName, position: m.position });
    membershipMap.set(m.watchlistItemId, list);
  }

  const result = items.map((item) => ({
    ...item,
    collections: membershipMap.get(item.id) || [],
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { tmdbId, mediaType, title, posterPath, overview, voteAverage, genreNames, releaseYear, collectionIds } = body;

  if (!tmdbId || !mediaType || !title) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(watchlistItems)
    .where(and(eq(watchlistItems.tmdbId, tmdbId), eq(watchlistItems.mediaType, mediaType)))
    .limit(1);

  if (existing) return NextResponse.json({ error: "Ya esta en la lista" }, { status: 409 });

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
      releaseYear: releaseYear || null,
    })
    .returning();

  // Add to collections if specified
  const ids: number[] = Array.isArray(collectionIds) ? collectionIds : body.collectionId ? [body.collectionId] : [];
  for (const colId of ids) {
    await db.insert(collectionItems).values({
      collectionId: colId,
      watchlistItemId: item.id,
      position: 0,
    });
  }

  return NextResponse.json(item, { status: 201 });
}
