import { 
  users, type User, type InsertUser,
  bookings, type Booking, type InsertBooking,
  fengShuiScores, type FengShuiScore, type InsertFengShuiScore,
  chatMessages, type ChatMessage, type InsertChatMessage,
  reviews, type Review, type InsertReview
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLoginTime(id: string): Promise<User | undefined>;

  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;

  // Feng Shui methods
  createFengShuiScore(score: InsertFengShuiScore): Promise<FengShuiScore>;
  getFengShuiScoreByAddress(address: string): Promise<FengShuiScore | undefined>;

  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviews(): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<string, User>;
  private bookingsStore: Map<number, Booking>;
  private fengShuiScoresStore: Map<number, FengShuiScore>;
  private chatMessagesStore: Map<number, ChatMessage>;
  private reviewsStore: Map<number, Review>;
  private currentBookingId: number;
  private currentFengShuiScoreId: number;
  private currentChatMessageId: number;
  private currentReviewId: number;

  constructor() {
    this.usersStore = new Map();
    this.bookingsStore = new Map();
    this.fengShuiScoresStore = new Map();
    this.chatMessagesStore = new Map();
    this.reviewsStore = new Map();
    this.currentBookingId = 1;
    this.currentFengShuiScoreId = 1;
    this.currentChatMessageId = 1;
    this.currentReviewId = 1;
  }

  // User methods - OAuth 기반으로 구현
  async getUser(id: string): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.provider === provider && user.providerId === providerId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // 기존 삽입 데이터에서 email을 제외한 필수 필드만 추출
    const { email, ...essentialFields } = insertUser;
    
    // User 객체 생성 (타입에 맞게 각 필드 명시적으로 설정)
    const user: User = {
      ...essentialFields,
      id: randomUUID(),
      email: email === undefined ? null : email,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    this.usersStore.set(user.id, user);
    return user;
  }

  async updateUserLoginTime(id: string): Promise<User | undefined> {
    const user = this.usersStore.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, lastLoginAt: new Date() };
    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
      comments: insertBooking.comments || null,
    };
    this.bookingsStore.set(id, booking);
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookingsStore.values());
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookingsStore.get(id);
  }

  // Feng Shui methods
  async createFengShuiScore(insertScore: InsertFengShuiScore): Promise<FengShuiScore> {
    const id = this.currentFengShuiScoreId++;
    const score: FengShuiScore = {
      ...insertScore,
      id,
      createdAt: new Date(),
    };
    this.fengShuiScoresStore.set(id, score);
    return score;
  }

  async getFengShuiScoreByAddress(address: string): Promise<FengShuiScore | undefined> {
    return Array.from(this.fengShuiScoresStore.values()).find(
      (score) => score.address.toLowerCase() === address.toLowerCase()
    );
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      birthdate: insertMessage.birthdate || null,
    };
    this.chatMessagesStore.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesStore.values());
  }
  
  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviewsStore.set(id, review);
    return review;
  }

  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviewsStore.values());
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviewsStore.get(id);
  }
}

export const storage = new MemStorage();
