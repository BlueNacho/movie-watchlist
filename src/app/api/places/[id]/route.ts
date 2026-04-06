import { db } from "@/db";
import { places } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cacheInvalidate } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const placeId = parseInt(id, 10);
  if (isNaN(placeId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl || null;
  if (body.address !== undefined) updates.address = body.address || null;
  if (body.category !== undefined) updates.category = body.category || null;
  if (body.notes !== undefined) updates.notes = body.notes || null;

  const [updated] = await db.update(places).set(updates).where(eq(places.id, placeId)).returning();
  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  cacheInvalidate("places");
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const placeId = parseInt(id, 10);
  if (isNaN(placeId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await db.delete(places).where(eq(places.id, placeId));
  cacheInvalidate("places");
  return NextResponse.json({ ok: true });
}
