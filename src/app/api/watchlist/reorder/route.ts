import { db } from "@/db";
import { collectionItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { cacheInvalidate } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

// Batch update positions within a collection
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { collectionId, items } = await request.json();
  if (!collectionId || !Array.isArray(items)) {
    return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
  }

  for (const { watchlistItemId, position } of items) {
    await db
      .update(collectionItems)
      .set({ position })
      .where(
        and(
          eq(collectionItems.collectionId, collectionId),
          eq(collectionItems.watchlistItemId, watchlistItemId)
        )
      );
  }

  cacheInvalidate("watchlist");
  return NextResponse.json({ ok: true });
}
