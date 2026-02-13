import {
  contents, favorites, watchProgress, venues, events,
  curations, curationItems, watchParties, partyMessages,
  qaSessions, qaMessages, userPoints, pointEvents, rewards,
  contentEvents, userProfiles, socialActivities, checkins, badges, userBadges,
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
  type ContentEvent, type InsertContentEvent,
  type UserProfile, type InsertUserProfile,
  type SocialActivity, type InsertSocialActivity,
  type Checkin, type InsertCheckin,
  type BadgeDef, type InsertBadge,
  type UserBadge, type InsertUserBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc, sql, count } from "drizzle-orm";

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

  trackEvent(event: InsertContentEvent): Promise<ContentEvent>;
  getAdminOverview(): Promise<{
    totalViews: number;
    ticketClicks: number;
    conversionRate: number;
    diversityTransitions: number;
    totalUsers: number;
  }>;
  getAdminHeatmap(): Promise<{ postalPrefix: string; views: number }[]>;
  getAdminRetention(): Promise<{ contentId: string; title: string; artist: string; totalWatchSeconds: number; viewCount: number }[]>;
  getAdminConversionFunnel(): Promise<{ contentId: string; title: string; views: number; ticketClicks: number }[]>;

  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getSocialFeed(limit?: number): Promise<(SocialActivity & { content?: Content; profile?: UserProfile })[]>;
  addSocialActivity(activity: InsertSocialActivity): Promise<SocialActivity>;

  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  getUserCheckins(userId: string): Promise<(Checkin & { venue: Venue })[]>;

  getAllBadges(): Promise<BadgeDef[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: BadgeDef })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  hasUserBadge(userId: string, badgeId: string): Promise<boolean>;
  createBadge(badge: InsertBadge): Promise<BadgeDef>;

  getUserDataExport(userId: string): Promise<any>;
  deleteUserData(userId: string): Promise<void>;
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
  async trackEvent(event: InsertContentEvent): Promise<ContentEvent> {
    const [created] = await db.insert(contentEvents).values(event).returning();
    return created;
  }

  async getAdminOverview() {
    const [viewsResult] = await db.select({ c: count() }).from(contentEvents).where(eq(contentEvents.eventType, "view_start"));
    const [ticketResult] = await db.select({ c: count() }).from(contentEvents).where(eq(contentEvents.eventType, "ticket_click"));
    const [diversityResult] = await db.select({ c: count() }).from(contentEvents).where(eq(contentEvents.eventType, "category_transition"));
    const allProfiles = await db.select({ c: count() }).from(userProfiles);
    const totalViews = viewsResult?.c || 0;
    const ticketClicks = ticketResult?.c || 0;
    return {
      totalViews,
      ticketClicks,
      conversionRate: totalViews > 0 ? Math.round((ticketClicks / totalViews) * 100) : 0,
      diversityTransitions: diversityResult?.c || 0,
      totalUsers: allProfiles[0]?.c || 0,
    };
  }

  async getAdminHeatmap() {
    const result = await db.select({
      postalPrefix: contentEvents.postalPrefix,
      views: count(),
    })
      .from(contentEvents)
      .where(and(
        eq(contentEvents.eventType, "view_start"),
        sql`${contentEvents.postalPrefix} IS NOT NULL`
      ))
      .groupBy(contentEvents.postalPrefix);
    return result.map(r => ({ postalPrefix: r.postalPrefix || "N/A", views: r.views }));
  }

  async getAdminRetention() {
    const allContent = await this.getAllContents();
    const result: { contentId: string; title: string; artist: string; totalWatchSeconds: number; viewCount: number }[] = [];
    for (const c of allContent) {
      const progress = await db.select({
        total: sql<number>`COALESCE(SUM(${watchProgress.progressSeconds}), 0)`,
        cnt: count(),
      }).from(watchProgress).where(eq(watchProgress.contentId, c.id));
      result.push({
        contentId: c.id,
        title: c.title,
        artist: c.artist,
        totalWatchSeconds: Number(progress[0]?.total || 0),
        viewCount: progress[0]?.cnt || 0,
      });
    }
    return result.filter(r => r.viewCount > 0).sort((a, b) => b.totalWatchSeconds - a.totalWatchSeconds);
  }

  async getAdminConversionFunnel() {
    const allContent = await this.getAllContents();
    const result: { contentId: string; title: string; views: number; ticketClicks: number }[] = [];
    for (const c of allContent) {
      const [views] = await db.select({ c: count() }).from(contentEvents).where(and(eq(contentEvents.contentId, c.id), eq(contentEvents.eventType, "view_start")));
      const [clicks] = await db.select({ c: count() }).from(contentEvents).where(and(eq(contentEvents.contentId, c.id), eq(contentEvents.eventType, "ticket_click")));
      if ((views?.c || 0) > 0 || (clicks?.c || 0) > 0) {
        result.push({ contentId: c.id, title: c.title, views: views?.c || 0, ticketClicks: clicks?.c || 0 });
      }
    }
    return result.sort((a, b) => b.views - a.views);
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(profile.userId);
    if (existing) {
      const [updated] = await db.update(userProfiles)
        .set({
          displayName: profile.displayName ?? existing.displayName,
          bio: profile.bio ?? existing.bio,
          avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
          isCuratorOptIn: profile.isCuratorOptIn ?? existing.isCuratorOptIn,
          isSocialOptIn: profile.isSocialOptIn ?? existing.isSocialOptIn,
          showFavorites: profile.showFavorites ?? existing.showFavorites,
          showWatchHistory: profile.showWatchHistory ?? existing.showWatchHistory,
          showReadings: profile.showReadings ?? existing.showReadings,
        })
        .where(eq(userProfiles.userId, profile.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async getSocialFeed(limit = 20): Promise<(SocialActivity & { content?: Content; profile?: UserProfile })[]> {
    const optInUsers = await db.select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.isSocialOptIn, true));
    const optInUserIds = optInUsers.map(u => u.userId);
    if (optInUserIds.length === 0) return [];

    const activities = await db.select().from(socialActivities)
      .where(sql`${socialActivities.userId} IN (${sql.join(optInUserIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(socialActivities.createdAt))
      .limit(limit);

    const result: (SocialActivity & { content?: Content; profile?: UserProfile })[] = [];
    for (const activity of activities) {
      const content = activity.contentId ? await this.getContent(activity.contentId) : undefined;
      const profile = await this.getUserProfile(activity.userId);
      result.push({ ...activity, content, profile: profile || undefined });
    }
    return result;
  }

  async addSocialActivity(activity: InsertSocialActivity): Promise<SocialActivity> {
    const [created] = await db.insert(socialActivities).values(activity).returning();
    return created;
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    const [created] = await db.insert(checkins).values(checkin).returning();
    return created;
  }

  async getUserCheckins(userId: string): Promise<(Checkin & { venue: Venue })[]> {
    const userCheckins = await db.select().from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.createdAt));
    const result: (Checkin & { venue: Venue })[] = [];
    for (const ci of userCheckins) {
      const venue = await this.getVenue(ci.venueId);
      if (venue) {
        result.push({ ...ci, venue });
      }
    }
    return result;
  }

  async getAllBadges(): Promise<BadgeDef[]> {
    return db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: BadgeDef })[]> {
    const ubs = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
    const result: (UserBadge & { badge: BadgeDef })[] = [];
    for (const ub of ubs) {
      const [badge] = await db.select().from(badges).where(eq(badges.id, ub.badgeId));
      if (badge) {
        result.push({ ...ub, badge });
      }
    }
    return result;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [created] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return created;
  }

  async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
    const [ub] = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    return !!ub;
  }

  async createBadge(badge: InsertBadge): Promise<BadgeDef> {
    const [created] = await db.insert(badges).values(badge).returning();
    return created;
  }

  async getUserDataExport(userId: string) {
    const profile = await this.getUserProfile(userId);
    const favs = await this.getFavorites(userId);
    const progress = await db.select().from(watchProgress).where(eq(watchProgress.userId, userId));
    const points = await this.getUserPoints(userId);
    const pEvents = await this.getPointEvents(userId);
    const userRewards = await this.getUserRewards(userId);
    const userCheckins = await this.getUserCheckins(userId);
    const userBadgeList = await this.getUserBadges(userId);
    return {
      profile,
      favorites: favs,
      watchProgress: progress,
      points,
      pointEvents: pEvents,
      rewards: userRewards,
      checkins: userCheckins,
      badges: userBadgeList,
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.userId, userId));
    await db.delete(watchProgress).where(eq(watchProgress.userId, userId));
    await db.delete(pointEvents).where(eq(pointEvents.userId, userId));
    await db.delete(userPoints).where(eq(userPoints.userId, userId));
    await db.delete(rewards).where(eq(rewards.userId, userId));
    await db.delete(socialActivities).where(eq(socialActivities.userId, userId));
    await db.delete(checkins).where(eq(checkins.userId, userId));
    await db.delete(userBadges).where(eq(userBadges.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await db.delete(contentEvents).where(eq(contentEvents.userId, userId));
  }
}

export const storage = new DatabaseStorage();
