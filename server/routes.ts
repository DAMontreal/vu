import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("join-party", (partyId: string) => {
      socket.join(`party-${partyId}`);
    });

    socket.on("party-message", async (data: { partyId: string; userId: string; userName: string; message: string }) => {
      const msg = await storage.addPartyMessage({
        partyId: data.partyId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
      });
      io.to(`party-${data.partyId}`).emit("new-party-message", msg);
    });

    socket.on("party-sync", (data: { partyId: string; action: string; time?: number }) => {
      socket.to(`party-${data.partyId}`).emit("party-sync", data);
    });

    socket.on("join-qa", (sessionId: string) => {
      socket.join(`qa-${sessionId}`);
    });

    socket.on("qa-message", async (data: { sessionId: string; userId: string; userName: string; message: string; isHost: boolean }) => {
      const msg = await storage.addQaMessage({
        sessionId: data.sessionId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        isHost: data.isHost,
      });
      io.to(`qa-${data.sessionId}`).emit("new-qa-message", msg);
    });
  });

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

  app.get("/api/venues", async (_req, res) => {
    try {
      const venueList = await storage.getAllVenues();
      res.json(venueList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.get("/api/events", async (_req, res) => {
    try {
      const eventList = await storage.getAllEvents();
      res.json(eventList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/tonight", async (_req, res) => {
    try {
      const eventList = await storage.getEventsTonight();
      res.json(eventList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tonight's events" });
    }
  });

  app.get("/api/curation/active", async (_req, res) => {
    try {
      const curation = await storage.getActiveCuration();
      res.json(curation || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch curation" });
    }
  });

  app.get("/api/watch-parties/:code", async (req, res) => {
    try {
      const party = await storage.getWatchPartyByCode(req.params.code);
      if (!party) {
        return res.status(404).json({ message: "Party not found" });
      }
      const content = await storage.getContent(party.contentId);
      const messages = await storage.getPartyMessages(party.id);
      res.json({ ...party, content, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch party" });
    }
  });

  app.post("/api/watch-parties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({
        contentId: z.string().min(1),
        title: z.string().min(1),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const party = await storage.createWatchParty({
        contentId: parsed.data.contentId,
        hostUserId: userId,
        title: parsed.data.title,
        code,
      });
      res.status(201).json(party);
    } catch (error) {
      res.status(500).json({ message: "Failed to create party" });
    }
  });

  app.get("/api/qa-sessions", async (_req, res) => {
    try {
      const sessions = await storage.getActiveQaSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA sessions" });
    }
  });

  app.get("/api/qa-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getQaSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      const content = await storage.getContent(session.contentId);
      const messages = await storage.getQaMessages(session.id);
      res.json({ ...session, content, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA session" });
    }
  });

  app.get("/api/passport", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const points = await storage.getUserPoints(userId);
      const history = await storage.getPointEvents(userId);
      const userRewards = await storage.getUserRewards(userId);
      res.json({
        totalPoints: points?.totalPoints || 0,
        history,
        rewards: userRewards,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passport" });
    }
  });

  app.post("/api/passport/earn", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({ contentId: z.string().min(1) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      await storage.addPoints(userId, parsed.data.contentId, 10);
      const points = await storage.getUserPoints(userId);
      res.json({ totalPoints: points?.totalPoints || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to earn points" });
    }
  });

  app.post("/api/passport/redeem", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({
        description: z.string().min(1),
        pointsCost: z.number().int().min(1),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const reward = await storage.redeemReward(userId, parsed.data.description, parsed.data.pointsCost);
      res.status(201).json(reward);
    } catch (error: any) {
      if (error.message === "Not enough points") {
        return res.status(400).json({ message: "Points insuffisants" });
      }
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // ─── Event Tracking ───
  app.post("/api/track", async (req: any, res) => {
    try {
      const parsed = z.object({
        contentId: z.string().min(1),
        eventType: z.enum(["page_view", "view_start", "view_end", "ticket_click", "category_transition", "favorite_add", "checkin"]),
        metadata: z.any().optional(),
        postalPrefix: z.string().max(3).optional(),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const userId = req.user?.claims?.sub || null;
      const event = await storage.trackEvent({
        userId,
        contentId: parsed.data.contentId,
        eventType: parsed.data.eventType,
        metadata: parsed.data.metadata || null,
        postalPrefix: parsed.data.postalPrefix || null,
      });
      res.status(201).json(event);
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  // ─── Admin Impact Dashboard ───
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const profile = await storage.getUserProfile(req.user.claims.sub);
    if (!profile?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  app.get("/api/admin/impact/overview", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const overview = await storage.getAdminOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      res.status(500).json({ message: "Failed to fetch overview" });
    }
  });

  app.get("/api/admin/impact/heatmap", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const heatmap = await storage.getAdminHeatmap();
      res.json(heatmap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heatmap" });
    }
  });

  app.get("/api/admin/impact/retention", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const retention = await storage.getAdminRetention();
      res.json(retention);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch retention" });
    }
  });

  app.get("/api/admin/impact/funnel", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const funnel = await storage.getAdminConversionFunnel();
      res.json(funnel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funnel" });
    }
  });

  // ─── User Profile (Loi 25 + Social Opt-in) ───
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profile = await storage.getUserProfile(userId);
      if (!profile) {
        profile = await storage.upsertUserProfile({ userId });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        isCuratorOptIn: z.boolean().optional(),
        isSocialOptIn: z.boolean().optional(),
        showFavorites: z.boolean().optional(),
        showWatchHistory: z.boolean().optional(),
        showReadings: z.boolean().optional(),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const profile = await storage.upsertUserProfile({ userId, ...parsed.data });
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ─── Social Feed (Foyer Numérique) ───
  app.get("/api/social/feed", async (_req, res) => {
    try {
      const feed = await storage.getSocialFeed(30);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social feed" });
    }
  });

  // ─── Check-in ───
  app.post("/api/checkins", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = z.object({
        venueId: z.string().min(1),
        eventId: z.string().optional(),
        method: z.enum(["qr", "geo"]),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const checkin = await storage.createCheckin({
        userId,
        venueId: parsed.data.venueId,
        eventId: parsed.data.eventId || null,
        method: parsed.data.method,
      });

      await storage.addPoints(userId, parsed.data.venueId, 15);

      await storage.addSocialActivity({
        userId,
        activityType: "checkin",
        venueId: parsed.data.venueId,
        contentId: null,
        description: null,
      });

      await storage.trackEvent({
        userId,
        contentId: parsed.data.venueId,
        eventType: "checkin",
        metadata: { method: parsed.data.method },
        postalPrefix: null,
      });

      const allCheckins = await storage.getUserCheckins(userId);
      const allBadges = await storage.getAllBadges();
      for (const badge of allBadges) {
        const criteria = badge.criteria as any;
        if (!criteria) continue;
        const has = await storage.hasUserBadge(userId, badge.id);
        if (has) continue;

        if (criteria.type === "checkin_count" && allCheckins.length >= criteria.count) {
          await storage.awardBadge(userId, badge.id);
        }
      }

      res.status(201).json(checkin);
    } catch (error) {
      console.error("Error creating checkin:", error);
      res.status(500).json({ message: "Failed to create checkin" });
    }
  });

  app.get("/api/checkins", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userCheckins = await storage.getUserCheckins(userId);
      res.json(userCheckins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checkins" });
    }
  });

  // ─── Badges ───
  app.get("/api/badges", async (_req, res) => {
    try {
      const allBadges = await storage.getAllBadges();
      res.json(allBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadgeList = await storage.getUserBadges(userId);
      res.json(userBadgeList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // ─── Loi 25: Data Export & Delete ───
  app.get("/api/privacy/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = await storage.getUserDataExport(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.delete("/api/privacy/data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUserData(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data" });
    }
  });

  // ─── Badge check on content view ───
  app.post("/api/badges/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allBadges = await storage.getAllBadges();
      const awarded: string[] = [];

      const watchedContent = await storage.getPointEvents(userId);
      const watchedCategories = new Set(watchedContent.map(e => e.content.category));
      const checkinsList = await storage.getUserCheckins(userId);

      for (const badge of allBadges) {
        const criteria = badge.criteria as any;
        if (!criteria) continue;
        const has = await storage.hasUserBadge(userId, badge.id);
        if (has) continue;

        if (criteria.type === "genre_count" && watchedCategories.size >= criteria.count) {
          await storage.awardBadge(userId, badge.id);
          awarded.push(badge.name);
        }
        if (criteria.type === "watch_count" && watchedContent.length >= criteria.count) {
          await storage.awardBadge(userId, badge.id);
          awarded.push(badge.name);
        }
        if (criteria.type === "checkin_count" && checkinsList.length >= criteria.count) {
          await storage.awardBadge(userId, badge.id);
          awarded.push(badge.name);
        }
      }

      res.json({ awarded });
    } catch (error) {
      res.status(500).json({ message: "Failed to check badges" });
    }
  });

  return httpServer;
}
