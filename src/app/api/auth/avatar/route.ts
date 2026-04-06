import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cacheInvalidate } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { avatarUrl } = await request.json();

  await db.update(users).set({ avatarUrl: avatarUrl || null }).where(eq(users.id, session.userId));

  cacheInvalidate("user-profile");
  return NextResponse.json({ ok: true });
}
