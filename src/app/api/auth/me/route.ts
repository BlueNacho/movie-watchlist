import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, DB_TTL } from "@/lib/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Return session + fresh avatar from DB
  const cacheKey = `user:${session.userId}`;
  const cached = cacheGet<{ avatarUrl: string | null }>(cacheKey);

  let avatarUrl = cached?.avatarUrl ?? null;
  if (!cached) {
    const [user] = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, session.userId)).limit(1);
    avatarUrl = user?.avatarUrl ?? null;
    cacheSet(cacheKey, { avatarUrl }, DB_TTL, ["user-profile"]);
  }

  return NextResponse.json({ ...session, avatarUrl });
}
