// Database storage implementation - see blueprints: javascript_database, javascript_log_in_with_replit
import {
  users,
  roadmapProgress,
  essays,
  essayVersions,
  universities,
  scholarships,
  achievements,
  userAchievements,
  type User,
  type UpsertUser,
  type RoadmapProgress,
  type InsertRoadmapProgress,
  type Essay,
  type InsertEssay,
  type EssayVersion,
  type InsertEssayVersion,
  type University,
  type Scholarship,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Roadmap operations
  getRoadmapProgress(userId: string): Promise<RoadmapProgress[]>;
  upsertRoadmapProgress(data: InsertRoadmapProgress): Promise<RoadmapProgress>;
  
  // Essay operations
  getEssays(userId: string): Promise<Essay[]>;
  getEssay(id: string, userId: string): Promise<Essay | undefined>;
  createEssay(data: InsertEssay): Promise<Essay>;
  updateEssay(id: string, userId: string, data: Partial<Essay>): Promise<Essay | undefined>;
  
  // Essay version operations
  getEssayVersions(essayId: string): Promise<EssayVersion[]>;
  getLatestEssayVersion(essayId: string): Promise<EssayVersion | undefined>;
  createEssayVersion(data: InsertEssayVersion): Promise<EssayVersion>;
  
  // University operations
  getUniversities(): Promise<University[]>;
  upsertUniversity(data: Partial<University>): Promise<University>;
  
  // Scholarship operations
  getScholarships(): Promise<Scholarship[]>;
  upsertScholarship(data: Partial<Scholarship>): Promise<Scholarship>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Roadmap operations
  async getRoadmapProgress(userId: string): Promise<RoadmapProgress[]> {
    return await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.userId, userId));
  }
  
  async upsertRoadmapProgress(data: InsertRoadmapProgress): Promise<RoadmapProgress> {
    const existing = await db
      .select()
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, data.userId),
          eq(roadmapProgress.phase, data.phase)
        )
      );
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(roadmapProgress)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(roadmapProgress.userId, data.userId),
            eq(roadmapProgress.phase, data.phase)
          )
        )
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(roadmapProgress)
        .values(data)
        .returning();
      return created;
    }
  }
  
  // Essay operations
  async getEssays(userId: string): Promise<Essay[]> {
    return await db
      .select()
      .from(essays)
      .where(eq(essays.userId, userId))
      .orderBy(desc(essays.updatedAt));
  }
  
  async getEssay(id: string, userId: string): Promise<Essay | undefined> {
    const [essay] = await db
      .select()
      .from(essays)
      .where(and(eq(essays.id, id), eq(essays.userId, userId)));
    return essay;
  }
  
  async createEssay(data: InsertEssay): Promise<Essay> {
    const [essay] = await db
      .insert(essays)
      .values(data)
      .returning();
    return essay;
  }
  
  async updateEssay(id: string, userId: string, data: Partial<Essay>): Promise<Essay | undefined> {
    const [updated] = await db
      .update(essays)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(essays.id, id), eq(essays.userId, userId)))
      .returning();
    return updated;
  }
  
  // Essay version operations
  async getEssayVersions(essayId: string): Promise<EssayVersion[]> {
    return await db
      .select()
      .from(essayVersions)
      .where(eq(essayVersions.essayId, essayId))
      .orderBy(desc(essayVersions.version));
  }
  
  async getLatestEssayVersion(essayId: string): Promise<EssayVersion | undefined> {
    const [version] = await db
      .select()
      .from(essayVersions)
      .where(eq(essayVersions.essayId, essayId))
      .orderBy(desc(essayVersions.version))
      .limit(1);
    return version;
  }
  
  async createEssayVersion(data: InsertEssayVersion): Promise<EssayVersion> {
    const [version] = await db
      .insert(essayVersions)
      .values(data)
      .returning();
    return version;
  }
  
  // University operations
  async getUniversities(): Promise<University[]> {
    return await db.select().from(universities);
  }

  async upsertUniversity(data: Partial<University>): Promise<University> {
    // If scorecardId exists, try to update existing record
    if (data.scorecardId) {
      const existing = await db
        .select()
        .from(universities)
        .where(eq(universities.scorecardId, data.scorecardId));
      
      if (existing.length > 0) {
        const [updated] = await db
          .update(universities)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(universities.scorecardId, data.scorecardId))
          .returning();
        return updated;
      }
    }
    
    // Otherwise insert new record
    const [university] = await db
      .insert(universities)
      .values(data as any)
      .returning();
    return university;
  }
  
  // Scholarship operations
  async getScholarships(): Promise<Scholarship[]> {
    return await db.select().from(scholarships);
  }

  async upsertScholarship(data: Partial<Scholarship>): Promise<Scholarship> {
    // If iefaId exists, try to update existing record
    if (data.iefaId) {
      const existing = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.iefaId, data.iefaId));
      
      if (existing.length > 0) {
        const [updated] = await db
          .update(scholarships)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(scholarships.iefaId, data.iefaId))
          .returning();
        return updated;
      }
    }
    
    // Otherwise insert new record
    const [scholarship] = await db
      .insert(scholarships)
      .values(data as any)
      .returning();
    return scholarship;
  }
  
  // Achievement operations
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }
  
  async createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement> {
    const [achievement] = await db
      .insert(userAchievements)
      .values(data)
      .returning();
    return achievement;
  }
}

export const storage = new DatabaseStorage();
