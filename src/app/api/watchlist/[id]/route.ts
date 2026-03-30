import { db } from "@/db";
import { watchlistItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};

  if (body.status && ["pending", "watching", "watched"].includes(body.status)) {
    updates.status = body.status;
    updates.watchedAt = body.status === "watched" ? new Date() : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const [updated] = await db
    .update(watchlistItems)
    .set(updates)
    .where(eq(watchlistItems.id, itemId))
    .returning();

  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // collection_items cascade on delete automatically
  const [deleted] = await db
    .delete(watchlistItems)
    .where(eq(watchlistItems.id, itemId))
    .returning();

  if (!deleted) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
