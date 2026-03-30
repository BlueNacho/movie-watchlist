import { pgTable, serial, text, timestamp, integer, varchar, pgEnum, boolean } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", ["blue", "pink"]);
export const watchStatusEnum = pgEnum("watch_status", ["pending", "watching", "watched"]);
export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  theme: themeEnum("theme").notNull().default("blue"),
  tosAccepted: boolean("tos_accepted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  tmdbId: integer("tmdb_id").notNull(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: text("poster_path"),
  overview: text("overview"),
  voteAverage: varchar("vote_average", { length: 10 }),
  genreNames: text("genre_names"),
  releaseYear: varchar("release_year", { length: 4 }),
  status: watchStatusEnum("status").notNull().default("pending"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  watchedAt: timestamp("watched_at"),
});

export const collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  watchlistItemId: integer("watchlist_item_id")
    .notNull()
    .references(() => watchlistItems.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
});
