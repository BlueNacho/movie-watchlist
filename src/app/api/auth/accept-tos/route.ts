import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await db
    .update(users)
    .set({ tosAccepted: true })
    .where(eq(users.id, session.userId));

  // Refresh session with updated flag
  await createSession({ ...session, tosAccepted: true });

  return NextResponse.json({ ok: true });
}
