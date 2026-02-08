import {
  contents, favorites, watchProgress,
  type Content, type InsertContent,
  type Favorite, type InsertFavorite,
  type WatchProgress, type InsertWatchProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
