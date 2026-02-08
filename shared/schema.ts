import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const contentTypeEnum = pgEnum("content_type", ["video", "book"]);
export const categoryEnum = pgEnum("category", [
  "theatre_contemporain",
  "danse_montreal",
  "litterature_essais",
  "coup_de_coeur_diversite",
  "spectacles_live",
]);

export const contents = pgTable("contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: contentTypeEnum("type").notNull(),
  category: categoryEnum("category").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  artist: text("artist").notNull(),
  duration: integer("duration"),
  venue: text("venue"),
  videoUrl: text("video_url"),
  ticketUrl: text("ticket_url"),
  bookFileUrl: text("book_file_url"),
  featured: boolean("featured").default(false),
  isLive: boolean("is_live").default(false),
  year: integer("year"),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  contentId: varchar("content_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchProgress = pgTable("watch_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  contentId: varchar("content_id").notNull(),
  progressSeconds: integer("progress_seconds").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentsRelations = relations(contents, ({ many }) => ({
  favorites: many(favorites),
  watchProgress: many(watchProgress),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  content: one(contents, {
    fields: [favorites.contentId],
    references: [contents.id],
  }),
}));

export const watchProgressRelations = relations(watchProgress, ({ one }) => ({
  content: one(contents, {
    fields: [watchProgress.contentId],
    references: [contents.id],
  }),
}));

export const insertContentSchema = createInsertSchema(contents).omit({ id: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertWatchProgressSchema = createInsertSchema(watchProgress).omit({ id: true, updatedAt: true });

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type WatchProgress = typeof watchProgress.$inferSelect;
export type InsertWatchProgress = z.infer<typeof insertWatchProgressSchema>;
