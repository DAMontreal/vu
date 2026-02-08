import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertFavoriteSchema, insertWatchProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/contents", async (_req, res) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  app.get("/api/contents/:id", async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get("/api/contents/category/:category", async (req, res) => {
    try {
      const contents = await storage.getContentsByCategory(req.params.category);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents by category:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const results = await storage.searchContents(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching contents:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favs = await storage.getFavorites(userId);
      res.json(favs);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get("/api/favorites/with-content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favs = await storage.getFavoritesWithContent(userId);
      res.json(favs);
    } catch (error) {
      console.error("Error fetching favorites with content:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({ contentId: z.string().min(1) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const { contentId } = parsed.data;
      const exists = await storage.isFavorite(userId, contentId);
      if (exists) {
        return res.status(409).json({ message: "Already in favorites" });
      }
      const fav = await storage.addFavorite({ userId, contentId });
      res.status(201).json(fav);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:contentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFavorite(userId, req.params.contentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.post("/api/watch-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({
        contentId: z.string().min(1),
        progressSeconds: z.number().int().min(0),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const { contentId, progressSeconds } = parsed.data;
      const progress = await storage.upsertWatchProgress({ userId, contentId, progressSeconds });
      res.json(progress);
    } catch (error) {
      console.error("Error saving watch progress:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/watch-progress/:contentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getWatchProgress(userId, req.params.contentId);
      res.json(progress || { progressSeconds: 0 });
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  return httpServer;
}
