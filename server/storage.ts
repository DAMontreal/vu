import {
  contents, favorites, watchProgress, venues, events,
  curations, curationItems, watchParties, partyMessages,
  qaSessions, qaMessages, userPoints, pointEvents, rewards,
  type Content, type InsertContent,
  type Favorite, type InsertFavorite,
  type WatchProgress, type InsertWatchProgress,
  type Venue, type InsertVenue,
  type Event, type InsertEvent,
  type Curation, type InsertCuration,
  type CurationItem, type InsertCurationItem,
  type WatchParty, type InsertWatchParty,
  type PartyMessage, type InsertPartyMessage,
  type QaSession, type InsertQaSession,
  type QaMessage, type InsertQaMessage,
  type UserPoints, type PointEvent,
  type Reward, type InsertReward,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getAllContents(): Promise<Content[]>;
  getContent(id: string): Promise<Content | undefined>;
  getContentsByCategory(category: string): Promise<Content[]>;
  getFeaturedContent(): Promise<Content | undefined>;
  searchContents(query: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;

  getFavorites(userId: string): Promise<Favorite[]>;
  getFavoritesWithContent(userId: string): Promise<(Favorite & { content: Content })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, contentId: string): Promise<void>;
  isFavorite(userId: string, contentId: string): Promise<boolean>;

  getWatchProgress(userId: string, contentId: string): Promise<WatchProgress | undefined>;
  upsertWatchProgress(progress: InsertWatchProgress): Promise<WatchProgress>;

  getAllVenues(): Promise<Venue[]>;
  getVenue(id: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;

  getEventsTonight(): Promise<(Event & { content: Content; venue: Venue })[]>;
  getAllEvents(): Promise<(Event & { content: Content; venue: Venue })[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  getActiveCuration(): Promise<(Curation & { items: (CurationItem & { content: Content })[] }) | undefined>;
  createCuration(curation: InsertCuration): Promise<Curation>;
  addCurationItem(item: InsertCurationItem): Promise<CurationItem>;

  getWatchParty(id: string): Promise<WatchParty | undefined>;
  getWatchPartyByCode(code: string): Promise<WatchParty | undefined>;
  createWatchParty(party: InsertWatchParty): Promise<WatchParty>;
  getPartyMessages(partyId: string): Promise<PartyMessage[]>;
  addPartyMessage(message: InsertPartyMessage): Promise<PartyMessage>;

  getActiveQaSessions(): Promise<(QaSession & { content: Content })[]>;
  getQaSession(id: string): Promise<QaSession | undefined>;
  getQaMessages(sessionId: string): Promise<QaMessage[]>;
  addQaMessage(message: InsertQaMessage): Promise<QaMessage>;
  createQaSession(session: InsertQaSession): Promise<QaSession>;

  getUserPoints(userId: string): Promise<UserPoints | undefined>;
  addPoints(userId: string, contentId: string, pts: number): Promise<void>;
  getPointEvents(userId: string): Promise<(PointEvent & { content: Content })[]>;
  getUserRewards(userId: string): Promise<Reward[]>;
  redeemReward(userId: string, description: string, pointsCost: number): Promise<Reward>;
}

export class DatabaseStorage implements IStorage {
  async getAllContents(): Promise<Content[]> {
    return db.select().from(contents);
  }

  async getContent(id: string): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentsByCategory(category: string): Promise<Content[]> {
    return db.select().from(contents).where(eq(contents.category, category as any));
  }

  async getFeaturedContent(): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.featured, true));
    return content;
  }

  async searchContents(query: string): Promise<Content[]> {
    return db.select().from(contents).where(
      or(
        ilike(contents.title, `%${query}%`),
        ilike(contents.artist, `%${query}%`)
      )
    );
  }

  async createContent(content: InsertContent): Promise<Content> {
    const [created] = await db.insert(contents).values(content).returning();
    return created;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavoritesWithContent(userId: string): Promise<(Favorite & { content: Content })[]> {
    const favs = await db.select().from(favorites).where(eq(favorites.userId, userId));
    const result: (Favorite & { content: Content })[] = [];
    for (const fav of favs) {
      const content = await this.getContent(fav.contentId);
      if (content) {
        result.push({ ...fav, content });
      }
    }
    return result;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(favorites).values(favorite).returning();
    return created;
  }

  async removeFavorite(userId: string, contentId: string): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.contentId, contentId))
    );
  }

  async isFavorite(userId: string, contentId: string): Promise<boolean> {
    const [fav] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.contentId, contentId))
    );
    return !!fav;
  }

  async getWatchProgress(userId: string, contentId: string): Promise<WatchProgress | undefined> {
    const [progress] = await db.select().from(watchProgress).where(
      and(eq(watchProgress.userId, userId), eq(watchProgress.contentId, contentId))
    );
    return progress;
  }

  async upsertWatchProgress(progress: InsertWatchProgress): Promise<WatchProgress> {
    const existing = await this.getWatchProgress(progress.userId, progress.contentId);
    if (existing) {
      const [updated] = await db.update(watchProgress)
        .set({ progressSeconds: progress.progressSeconds, updatedAt: new Date() })
        .where(eq(watchProgress.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(watchProgress).values(progress).returning();
    return created;
  }

  async getAllVenues(): Promise<Venue[]> {
    return db.select().from(venues);
  }

  async getVenue(id: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue;
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [created] = await db.insert(venues).values(venue).returning();
    return created;
  }

  async getEventsTonight(): Promise<(Event & { content: Content; venue: Venue })[]> {
    const allEvents = await db.select().from(events).where(eq(events.isTonight, true));
    const result: (Event & { content: Content; venue: Venue })[] = [];
    for (const evt of allEvents) {
      const content = await this.getContent(evt.contentId);
      const venue = await this.getVenue(evt.venueId);
      if (content && venue) {
        result.push({ ...evt, content, venue });
      }
    }
    return result;
  }

  async getAllEvents(): Promise<(Event & { content: Content; venue: Venue })[]> {
    const allEvents = await db.select().from(events);
    const result: (Event & { content: Content; venue: Venue })[] = [];
    for (const evt of allEvents) {
      const content = await this.getContent(evt.contentId);
      const venue = await this.getVenue(evt.venueId);
      if (content && venue) {
        result.push({ ...evt, content, venue });
      }
    }
    return result;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async getActiveCuration(): Promise<(Curation & { items: (CurationItem & { content: Content })[] }) | undefined> {
    const [curation] = await db.select().from(curations).where(eq(curations.active, true));
    if (!curation) return undefined;
    const items = await db.select().from(curationItems)
      .where(eq(curationItems.curationId, curation.id))
      .orderBy(curationItems.sortOrder);
    const itemsWithContent: (CurationItem & { content: Content })[] = [];
    for (const item of items) {
      const content = await this.getContent(item.contentId);
      if (content) {
        itemsWithContent.push({ ...item, content });
      }
    }
    return { ...curation, items: itemsWithContent };
  }

  async createCuration(curation: InsertCuration): Promise<Curation> {
    const [created] = await db.insert(curations).values(curation).returning();
    return created;
  }

  async addCurationItem(item: InsertCurationItem): Promise<CurationItem> {
    const [created] = await db.insert(curationItems).values(item).returning();
    return created;
  }

  async getWatchParty(id: string): Promise<WatchParty | undefined> {
    const [party] = await db.select().from(watchParties).where(eq(watchParties.id, id));
    return party;
  }

  async getWatchPartyByCode(code: string): Promise<WatchParty | undefined> {
    const [party] = await db.select().from(watchParties)
      .where(and(eq(watchParties.code, code), eq(watchParties.isActive, true)));
    return party;
  }

  async createWatchParty(party: InsertWatchParty): Promise<WatchParty> {
    const [created] = await db.insert(watchParties).values(party).returning();
    return created;
  }

  async getPartyMessages(partyId: string): Promise<PartyMessage[]> {
    return db.select().from(partyMessages)
      .where(eq(partyMessages.partyId, partyId))
      .orderBy(partyMessages.createdAt);
  }

  async addPartyMessage(message: InsertPartyMessage): Promise<PartyMessage> {
    const [created] = await db.insert(partyMessages).values(message).returning();
    return created;
  }

  async getActiveQaSessions(): Promise<(QaSession & { content: Content })[]> {
    const sessions = await db.select().from(qaSessions).where(eq(qaSessions.isActive, true));
    const result: (QaSession & { content: Content })[] = [];
    for (const session of sessions) {
      const content = await this.getContent(session.contentId);
      if (content) {
        result.push({ ...session, content });
      }
    }
    return result;
  }

  async getQaSession(id: string): Promise<QaSession | undefined> {
    const [session] = await db.select().from(qaSessions).where(eq(qaSessions.id, id));
    return session;
  }

  async getQaMessages(sessionId: string): Promise<QaMessage[]> {
    return db.select().from(qaMessages)
      .where(eq(qaMessages.sessionId, sessionId))
      .orderBy(qaMessages.createdAt);
  }

  async addQaMessage(message: InsertQaMessage): Promise<QaMessage> {
    const [created] = await db.insert(qaMessages).values(message).returning();
    return created;
  }

  async createQaSession(session: InsertQaSession): Promise<QaSession> {
    const [created] = await db.insert(qaSessions).values(session).returning();
    return created;
  }

  async getUserPoints(userId: string): Promise<UserPoints | undefined> {
    const [pts] = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    return pts;
  }

  async addPoints(userId: string, contentId: string, pts: number): Promise<void> {
    const existing = await this.getUserPoints(userId);
    if (existing) {
      await db.update(userPoints)
        .set({ totalPoints: sql`${userPoints.totalPoints} + ${pts}` })
        .where(eq(userPoints.userId, userId));
    } else {
      await db.insert(userPoints).values({ userId, totalPoints: pts });
    }
    await db.insert(pointEvents).values({ userId, contentId, points: pts });
  }

  async getPointEvents(userId: string): Promise<(PointEvent & { content: Content })[]> {
    const evts = await db.select().from(pointEvents)
      .where(eq(pointEvents.userId, userId))
      .orderBy(desc(pointEvents.createdAt));
    const result: (PointEvent & { content: Content })[] = [];
    for (const evt of evts) {
      const content = await this.getContent(evt.contentId);
      if (content) {
        result.push({ ...evt, content });
      }
    }
    return result;
  }

  async getUserRewards(userId: string): Promise<Reward[]> {
    return db.select().from(rewards)
      .where(eq(rewards.userId, userId))
      .orderBy(desc(rewards.createdAt));
  }

  async redeemReward(userId: string, description: string, pointsCost: number): Promise<Reward> {
    const pts = await this.getUserPoints(userId);
    if (!pts || pts.totalPoints! < pointsCost) {
      throw new Error("Not enough points");
    }
    await db.update(userPoints)
      .set({ totalPoints: sql`${userPoints.totalPoints} - ${pointsCost}` })
      .where(eq(userPoints.userId, userId));
    const code = `VU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const [reward] = await db.insert(rewards).values({
      userId,
      code,
      description,
      pointsCost,
    }).returning();
    return reward;
  }
}

export const storage = new DatabaseStorage();
