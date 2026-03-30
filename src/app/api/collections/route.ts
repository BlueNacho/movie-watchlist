import { db } from "@/db";
import { collections } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { cacheGet, cacheSet, cacheInvalidate, DB_TTL } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const cacheKey = "collections:all";
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = await db.select().from(collections).orderBy(collections.name);
  cacheSet(cacheKey, result, DB_TTL, ["collections"]);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const [item] = await db.insert(collections).values({ name: name.trim() }).returning();
  cacheInvalidate("collections");
  return NextResponse.json(item, { status: 201 });
}
