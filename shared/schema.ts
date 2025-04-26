import { pgTable, text, serial, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 새로운 사용자 스키마 - OAuth 인증 기반으로 변경
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(), // 'naver' 또는 'kakao'
  provider_id: text("provider_id").notNull().unique(), // 외부 제공자로부터의 고유 ID
  nickname: text("nickname").notNull(),
  email: text("email"),
  // 회원가입 필수 필드
  fullName: text("full_name"),          // 실명
  phoneNumber: text("phone_number"),    // 전화번호
  gender: text("gender").notNull(),     // 성별
  birthYear: text("birth_year").notNull(), // 출생년도
  birthMonth: text("birth_month").notNull(), // 출생월
  birthDay: text("birth_day").notNull(), // 출생일
  birthTime: text("birth_time"),        // 출생시간 (선택)
  ageRange: text("age_range").notNull(), // 연령대
  isTimeUnknown: boolean("is_time_unknown").notNull().default(false), // 출생시간 모름
  isRegistered: boolean("is_registered").notNull().default(false), // 회원가입 완료 여부
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
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

// Review schema
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
