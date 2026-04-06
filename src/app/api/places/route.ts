import { db } from "@/db";
import { places, placeRatings, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { cacheGet, cacheSet, cacheInvalidate, DB_TTL } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const cacheKey = "places:all";
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const allPlaces = await db
    .select({
      id: places.id,
      name: places.name,
      imageUrl: places.imageUrl,
      address: places.address,
      category: places.category,
      notes: places.notes,
      visitedAt: places.visitedAt,
      addedBy: users.username,
      createdAt: places.createdAt,
    })
    .from(places)
    .innerJoin(users, eq(places.addedBy, users.id))
    .orderBy(desc(places.visitedAt), desc(places.createdAt));

  const allRatings = await db
    .select({
      placeId: placeRatings.placeId,
      userId: placeRatings.userId,
      username: users.username,
      avatarUrl: users.avatarUrl,
      score: placeRatings.score,
      comment: placeRatings.comment,
    })
    .from(placeRatings)
    .innerJoin(users, eq(placeRatings.userId, users.id));

  const ratingsMap = new Map<number, { username: string; avatarUrl: string | null; score: number; comment: string | null }[]>();
  for (const r of allRatings) {
    const list = ratingsMap.get(r.placeId) || [];
    list.push({ username: r.username, avatarUrl: r.avatarUrl, score: parseFloat(r.score), comment: r.comment });
    ratingsMap.set(r.placeId, list);
  }

  const result = allPlaces.map((p) => ({
    ...p,
    ratings: ratingsMap.get(p.id) || [],
  }));

  cacheSet(cacheKey, result, DB_TTL, ["places"]);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, imageUrl, address, category, notes, visitedAt } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const [place] = await db
    .insert(places)
    .values({
      name: name.trim(),
      imageUrl: imageUrl || null,
      address: address || null,
      category: category || null,
      notes: notes || null,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
      addedBy: session.userId,
    })
    .returning();

  cacheInvalidate("places");
  return NextResponse.json(place, { status: 201 });
}
