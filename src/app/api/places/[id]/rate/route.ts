import { db } from "@/db";
import { placeRatings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { cacheInvalidate } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

// Create or update a rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const placeId = parseInt(id, 10);
  if (isNaN(placeId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const { score, comment } = await request.json();
  if (score === undefined || score < 0 || score > 5) {
    return NextResponse.json({ error: "Score debe ser 0-5" }, { status: 400 });
  }

  // Upsert: check if rating exists
  const [existing] = await db
    .select()
    .from(placeRatings)
    .where(and(eq(placeRatings.placeId, placeId), eq(placeRatings.userId, session.userId)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(placeRatings)
      .set({ score: String(score), comment: comment || null })
      .where(eq(placeRatings.id, existing.id))
      .returning();
    cacheInvalidate("places");
    return NextResponse.json(updated);
  }

  const [rating] = await db
    .insert(placeRatings)
    .values({
      placeId,
      userId: session.userId,
      score: String(score),
      comment: comment || null,
    })
    .returning();

  cacheInvalidate("places");
  return NextResponse.json(rating, { status: 201 });
}
