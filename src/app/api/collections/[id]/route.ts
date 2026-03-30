import { db } from "@/db";
import { collections } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const collectionId = parseInt(id, 10);
  if (isNaN(collectionId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // collection_items cascade on delete automatically
  await db.delete(collections).where(eq(collections.id, collectionId));
  return NextResponse.json({ ok: true });
}
