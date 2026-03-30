import { neon } from "@neondatabase/serverless";

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL required"); process.exit(1); }

  const sql = neon(url);

  // Create collection_items table
  await sql`
    CREATE TABLE IF NOT EXISTS collection_items (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      watchlist_item_id INTEGER NOT NULL REFERENCES watchlist_items(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0
    )
  `;
  console.log("Created collection_items table");

  // Migrate existing data if any
  const existing = await sql`
    SELECT id, collection_id, collection_order FROM watchlist_items WHERE collection_id IS NOT NULL
  `;
  for (const row of existing) {
    await sql`
      INSERT INTO collection_items (collection_id, watchlist_item_id, position)
      VALUES (${row.collection_id}, ${row.id}, ${row.collection_order || 0})
      ON CONFLICT DO NOTHING
    `;
  }
  if (existing.length > 0) console.log(`Migrated ${existing.length} items`);

  // Drop old columns
  await sql`ALTER TABLE watchlist_items DROP COLUMN IF EXISTS collection_id`;
  await sql`ALTER TABLE watchlist_items DROP COLUMN IF EXISTS collection_order`;
  console.log("Dropped old columns");

  console.log("Migration complete!");
}

migrate().catch(console.error);
