import { db } from "@/db";
import { collectionItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { cacheInvalidate } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

// Add item to collection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const collectionId = parseInt(id, 10);
  const { watchlistItemId } = await request.json();

  if (isNaN(collectionId) || !watchlistItemId) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  // Check if already in collection
  const [existing] = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.collectionId, collectionId), eq(collectionItems.watchlistItemId, watchlistItemId)))
    .limit(1);

  if (existing) return NextResponse.json({ error: "Ya esta en la coleccion" }, { status: 409 });

  // Get max position
  const items = await db
    .select({ position: collectionItems.position })
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, collectionId));
  const maxPos = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 0;

  const [item] = await db
    .insert(collectionItems)
    .values({ collectionId, watchlistItemId, position: maxPos })
    .returning();

  cacheInvalidate("watchlist");
  return NextResponse.json(item, { status: 201 });
}


// Remove item from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const collectionId = parseInt(id, 10);
  const { watchlistItemId } = await request.json();

  await db
    .delete(collectionItems)
    .where(and(eq(collectionItems.collectionId, collectionId), eq(collectionItems.watchlistItemId, watchlistItemId)));

  cacheInvalidate("watchlist");
  return NextResponse.json({ ok: true });
}
