import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Essay Feedback type (not stored in DB, returned from AI)
export const essayFeedbackSchema = z.object({
  tone: z.string(),
  clarity: z.string(),
  storytelling: z.string(),
  suggestions: z.array(z.string()),
  overallScore: z.number().min(1).max(10),
});

export type EssayFeedback = z.infer<typeof essayFeedbackSchema>;

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  academicScores: jsonb("academic_scores").$type<{
    kcseGrade?: string;
    kcsePoints?: number;
    kcseSubjects?: { subject: string; grade: string }[];
    aLevelGrades?: { subject: string; grade: string }[];
    aLevelPoints?: number;
    examType?: 'kcse' | 'alevel' | 'both';
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Roadmap phases enum
export const roadmapPhases = [
  "research",
  "profile_building",
  "essay_writing",
  "applications",
  "financial_aid",
  "interviews",
  "visa_prep"
] as const;

// Roadmap progress tracking
export const roadmapProgress = pgTable("roadmap_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  phase: varchar("phase", { length: 50 }).notNull(),
  completed: boolean("completed").default(false),
  checklist: jsonb("checklist").notNull().$type<{ item: string; completed: boolean }[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roadmapProgressRelations = relations(roadmapProgress, ({ one }) => ({
  user: one(users, {
    fields: [roadmapProgress.userId],
    references: [users.id],
  }),
}));

export type RoadmapProgress = typeof roadmapProgress.$inferSelect;
export type InsertRoadmapProgress = typeof roadmapProgress.$inferInsert;

export const insertRoadmapProgressSchema = createInsertSchema(roadmapProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Essays table
export const essays = pgTable("essays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt"),
  currentVersion: integer("current_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const essaysRelations = relations(essays, ({ one, many }) => ({
  user: one(users, {
    fields: [essays.userId],
    references: [users.id],
  }),
  versions: many(essayVersions),
}));

export type Essay = typeof essays.$inferSelect;
export type InsertEssay = typeof essays.$inferInsert;

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  currentVersion: true,
  createdAt: true,
  updatedAt: true,
});

// Essay versions for tracking revisions
export const essayVersions = pgTable("essay_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  essayId: varchar("essay_id").notNull().references(() => essays.id, { onDelete: 'cascade' }),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").default(0),
  aiFeedback: jsonb("ai_feedback").$type<{ 
    tone?: string; 
    clarity?: string; 
    storytelling?: string; 
    suggestions?: string[];
    overallScore?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const essayVersionsRelations = relations(essayVersions, ({ one }) => ({
  essay: one(essays, {
    fields: [essayVersions.essayId],
    references: [essays.id],
  }),
}));

export type EssayVersion = typeof essayVersions.$inferSelect;
export type InsertEssayVersion = typeof essayVersions.$inferInsert;

export const insertEssayVersionSchema = createInsertSchema(essayVersions).omit({
  id: true,
  createdAt: true,
});

// Universities database - enhanced with College Scorecard data
export const universities = pgTable("universities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scorecardId: integer("scorecard_id").unique(), // College Scorecard API ID
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 100 }), // liberal arts, research, etc
  acceptanceRate: integer("acceptance_rate"), // percentage (0-100)
  averageKCSEScore: integer("average_kcse_score"),
  tuitionInState: integer("tuition_in_state"),
  tuitionOutOfState: integer("tuition_out_of_state"),
  tuitionUSD: integer("tuition_usd"),
  financialAidAvailable: boolean("financial_aid_available").default(false),
  meetFullNeed: boolean("meet_full_need").default(false),
  applicationDeadline: varchar("application_deadline", { length: 100 }),
  majorsOffered: text("majors_offered").array(),
  websiteUrl: varchar("website_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  description: text("description"),
  // College Scorecard fields
  completionRate: integer("completion_rate"), // graduation rate percentage
  studentSize: integer("student_size"),
  averageCostOfAttendance: integer("average_cost_of_attendance"),
  medianEarnings: integer("median_earnings"), // 10 years after entry
  satScoreAverage: integer("sat_score_average"),
  actScoreAverage: integer("act_score_average"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type University = typeof universities.$inferSelect;
export type InsertUniversity = typeof universities.$inferInsert;

// Scholarships database - enhanced for IEFA scraping
export const scholarships = pgTable("scholarships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  iefaId: varchar("iefa_id", { length: 100 }).unique(), // IEFA scholarship ID
  name: varchar("name", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  amountUSD: integer("amount_usd"),
  amountRange: varchar("amount_range", { length: 100 }), // e.g., "$1,000 - $5,000"
  eligibility: text("eligibility"),
  deadline: varchar("deadline", { length: 100 }),
  applicationUrl: varchar("application_url", { length: 500 }),
  forKenyanStudents: boolean("for_kenyan_students").default(true),
  needBased: boolean("need_based").default(false),
  meritBased: boolean("merit_based").default(false),
  fieldOfStudy: varchar("field_of_study", { length: 255 }), // major/field restriction
  hostCountries: text("host_countries").array(), // countries where you can study
  nationality: varchar("nationality", { length: 255 }), // eligible nationalities
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = typeof scholarships.$inferInsert;

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Achievements/Badges system
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  category: varchar("category", { length: 100 }), // essay, roadmap, research, etc
  criteria: text("criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
