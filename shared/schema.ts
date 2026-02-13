import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum, real } from "drizzle-orm/pg-core";
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
  "concerts",
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

export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  imageUrl: text("image_url"),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull(),
  venueId: varchar("venue_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isTonight: boolean("is_tonight").default(false),
});

export const curations = pgTable("curations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  artistBio: text("artist_bio").notNull(),
  artistImageUrl: text("artist_image_url"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  active: boolean("active").default(true),
});

export const curationItems = pgTable("curation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  curationId: varchar("curation_id").notNull(),
  contentId: varchar("content_id").notNull(),
  note: text("note"),
  sortOrder: integer("sort_order").default(0),
});

export const watchParties = pgTable("watch_parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull(),
  hostUserId: varchar("host_user_id").notNull(),
  title: text("title").notNull(),
  code: varchar("code").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partyMessages = pgTable("party_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partyId: varchar("party_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qaSessions = pgTable("qa_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull(),
  hostName: text("host_name").notNull(),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  isActive: boolean("is_active").default(false),
});

export const qaMessages = pgTable("qa_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  isHost: boolean("is_host").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPoints = pgTable("user_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
});

export const pointEvents = pgTable("point_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  contentId: varchar("content_id").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  code: varchar("code").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  redeemed: boolean("redeemed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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

export const eventsRelations = relations(events, ({ one }) => ({
  content: one(contents, {
    fields: [events.contentId],
    references: [contents.id],
  }),
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
}));

export const curationItemsRelations = relations(curationItems, ({ one }) => ({
  curation: one(curations, {
    fields: [curationItems.curationId],
    references: [curations.id],
  }),
  content: one(contents, {
    fields: [curationItems.contentId],
    references: [contents.id],
  }),
}));

export const insertContentSchema = createInsertSchema(contents).omit({ id: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertWatchProgressSchema = createInsertSchema(watchProgress).omit({ id: true, updatedAt: true });
export const insertVenueSchema = createInsertSchema(venues).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertCurationSchema = createInsertSchema(curations).omit({ id: true });
export const insertCurationItemSchema = createInsertSchema(curationItems).omit({ id: true });
export const insertWatchPartySchema = createInsertSchema(watchParties).omit({ id: true, createdAt: true });
export const insertPartyMessageSchema = createInsertSchema(partyMessages).omit({ id: true, createdAt: true });
export const insertQaSessionSchema = createInsertSchema(qaSessions).omit({ id: true });
export const insertQaMessageSchema = createInsertSchema(qaMessages).omit({ id: true, createdAt: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true, createdAt: true });

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type WatchProgress = typeof watchProgress.$inferSelect;
export type InsertWatchProgress = z.infer<typeof insertWatchProgressSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Curation = typeof curations.$inferSelect;
export type InsertCuration = z.infer<typeof insertCurationSchema>;
export type CurationItem = typeof curationItems.$inferSelect;
export type InsertCurationItem = z.infer<typeof insertCurationItemSchema>;
export type WatchParty = typeof watchParties.$inferSelect;
export type InsertWatchParty = z.infer<typeof insertWatchPartySchema>;
export type PartyMessage = typeof partyMessages.$inferSelect;
export type InsertPartyMessage = z.infer<typeof insertPartyMessageSchema>;
export type QaSession = typeof qaSessions.$inferSelect;
export type InsertQaSession = z.infer<typeof insertQaSessionSchema>;
export type QaMessage = typeof qaMessages.$inferSelect;
export type InsertQaMessage = z.infer<typeof insertQaMessageSchema>;
export type UserPoints = typeof userPoints.$inferSelect;
export type PointEvent = typeof pointEvents.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
