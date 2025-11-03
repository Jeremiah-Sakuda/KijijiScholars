import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getEssayFeedback } from "./openai";
import { 
  insertRoadmapProgressSchema,
  insertEssaySchema,
  insertEssayVersionSchema,
} from "@shared/schema";
import { z } from "zod";

// Helper to get user ID from request
function getUserId(req: Request): string {
  const user = req.user as any;
  return user?.claims?.sub;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Roadmap routes
  app.get("/api/roadmap", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const progress = await storage.getRoadmapProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      res.status(500).json({ message: "Failed to fetch roadmap" });
    }
  });

  app.post("/api/roadmap", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertRoadmapProgressSchema.parse({
        ...req.body,
        userId,
      });
      
      const progress = await storage.upsertRoadmapProgress(data);
      res.json(progress);
    } catch (error) {
      console.error("Error updating roadmap:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update roadmap" });
    }
  });

  // Essay routes
  app.get("/api/essays", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const essays = await storage.getEssays(userId);
      res.json(essays);
    } catch (error) {
      console.error("Error fetching essays:", error);
      res.status(500).json({ message: "Failed to fetch essays" });
    }
  });

  app.get("/api/essays/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const essay = await storage.getEssay(id, userId);
      
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      res.json(essay);
    } catch (error) {
      console.error("Error fetching essay:", error);
      res.status(500).json({ message: "Failed to fetch essay" });
    }
  });

  app.post("/api/essays", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertEssaySchema.parse({
        ...req.body,
        userId,
      });
      
      const essay = await storage.createEssay(data);
      
      // Create initial version
      await storage.createEssayVersion({
        essayId: essay.id,
        version: 1,
        content: "",
        wordCount: 0,
      });
      
      res.json(essay);
    } catch (error) {
      console.error("Error creating essay:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create essay" });
    }
  });

  app.patch("/api/essays/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      
      const updated = await storage.updateEssay(id, userId, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating essay:", error);
      res.status(500).json({ message: "Failed to update essay" });
    }
  });

  // Essay version routes
  app.get("/api/essays/:id/versions", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      
      // Verify ownership
      const essay = await storage.getEssay(id, userId);
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      const versions = await storage.getEssayVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch versions" });
    }
  });

  app.post("/api/essays/:id/versions", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      
      // Verify ownership
      const essay = await storage.getEssay(id, userId);
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      const data = insertEssayVersionSchema.parse({
        ...req.body,
        essayId: id,
      });
      
      const version = await storage.createEssayVersion(data);
      
      // Update essay's current version
      await storage.updateEssay(id, userId, {
        currentVersion: data.version,
      });
      
      res.json(version);
    } catch (error) {
      console.error("Error creating version:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create version" });
    }
  });

  // AI Essay Feedback route
  app.post("/api/essays/:id/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Essay content is required" });
      }
      
      // Verify ownership
      const essay = await storage.getEssay(id, userId);
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      // Get AI feedback
      const feedback = await getEssayFeedback(content, essay.prompt || undefined);
      
      res.json(feedback);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      res.status(500).json({ message: "Failed to generate AI feedback" });
    }
  });

  // University routes
  app.get("/api/universities", async (req, res) => {
    try {
      const universities = await storage.getUniversities();
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  // Scholarship routes
  app.get("/api/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarships();
      res.json(scholarships);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });

  // Achievement routes
  app.get("/api/achievements/user", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
