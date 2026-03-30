import { db } from "@/db";
import { watchlistItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Update watchlist item (toggle watched/pending)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "watched"].includes(status)) {
    return NextResponse.json({ error: "Status invalido" }, { status: 400 });
  }

  const [updated] = await db
    .update(watchlistItems)
    .set({
      status,
      watchedAt: status === "watched" ? new Date() : null,
    })
    .where(
      and(
        eq(watchlistItems.id, itemId),
        eq(watchlistItems.userId, session.userId)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// Remove from watchlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const [deleted] = await db
    .delete(watchlistItems)
    .where(
      and(
        eq(watchlistItems.id, itemId),
        eq(watchlistItems.userId, session.userId)
      )
    )
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
