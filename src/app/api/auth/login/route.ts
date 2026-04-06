import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { username, pin, password } = await request.json();

  if (!username || (!pin && !password)) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  // PIN auth (primary)
  if (pin) {
    if (!user.pinHash) {
      return NextResponse.json({ error: "PIN no configurado" }, { status: 401 });
    }
    const valid = await compare(pin, user.pinHash);
    if (!valid) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }
  }
  // Password auth (fallback)
  else if (password) {
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }
  }

  await createSession({
    userId: user.id,
    username: user.username,
    theme: user.theme,
    tosAccepted: user.tosAccepted,
  });

  return NextResponse.json({
    userId: user.id,
    username: user.username,
    theme: user.theme,
    tosAccepted: user.tosAccepted,
  });
}
