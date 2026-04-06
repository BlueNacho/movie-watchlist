import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

async function seedPins() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL required"); process.exit(1); }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const pins = [
    { username: "nacho", pin: "6386" },
    { username: "vicki", pin: "3333" },
  ];

  for (const { username, pin } of pins) {
    const pinHash = await hash(pin, 12);
    await db.update(schema.users).set({ pinHash }).where(eq(schema.users.username, username));
    console.log(`PIN set for "${username}"`);
  }

  console.log("Done!");
}

seedPins().catch(console.error);
