import { db } from "@/db";
import { users } from "@/db/schema";
import { cacheGet, cacheSet, DB_TTL } from "@/lib/cache";
import { NextResponse } from "next/server";

// Public endpoint - returns basic user info for the login selector
export async function GET() {
  const cacheKey = "users:public";
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = await db
    .select({ username: users.username, avatarUrl: users.avatarUrl, theme: users.theme })
    .from(users);

  cacheSet(cacheKey, result, DB_TTL, ["user-profile"]);
  return NextResponse.json(result);
}
