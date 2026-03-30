import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  // Change these before running!
  const users = [
    { username: "user1", password: "change-me-123", theme: "blue" as const },
    { username: "user2", password: "change-me-456", theme: "pink" as const },
  ];

  for (const user of users) {
    const passwordHash = await hash(user.password, 12);
    await db
      .insert(schema.users)
      .values({
        username: user.username,
        passwordHash,
        theme: user.theme,
      })
      .onConflictDoNothing();
    console.log(`User "${user.username}" created (theme: ${user.theme})`);
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
