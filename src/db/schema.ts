import { pgTable, serial, text, timestamp, integer, varchar, pgEnum } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", ["blue", "pink"]);
export const watchStatusEnum = pgEnum("watch_status", ["pending", "watched"]);
export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  theme: themeEnum("theme").notNull().default("blue"),
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
  genreNames: text("genre_names"), // comma-separated
  status: watchStatusEnum("status").notNull().default("pending"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  watchedAt: timestamp("watched_at"),
});
