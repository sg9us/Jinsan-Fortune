import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthdate: text("birthdate").notNull(),
  phone: text("phone").notNull(),
  serviceType: text("service_type").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Feng Shui score schema
export const fengShuiScores = pgTable("feng_shui_scores", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  overallScore: integer("overall_score").notNull(),
  wealthScore: integer("wealth_score").notNull(),
  healthScore: integer("health_score").notNull(),
  relationshipScore: integer("relationship_score").notNull(),
  careerScore: integer("career_score").notNull(),
  overall: text("overall").notNull(),
  advice: text("advice").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFengShuiScoreSchema = createInsertSchema(fengShuiScores).omit({
  id: true,
  createdAt: true,
});

export type InsertFengShuiScore = z.infer<typeof insertFengShuiScoreSchema>;
export type FengShuiScore = typeof fengShuiScores.$inferSelect;

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  birthdate: text("birthdate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
