import { 
  users, type User, type InsertUser,
  bookings, type Booking, type InsertBooking,
  fengShuiScores, type FengShuiScore, type InsertFengShuiScore,
  chatMessages, type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookingsStore: Map<number, Booking>;
  private fengShuiScoresStore: Map<number, FengShuiScore>;
  private chatMessagesStore: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentBookingId: number;
  private currentFengShuiScoreId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.bookingsStore = new Map();
    this.fengShuiScoresStore = new Map();
    this.chatMessagesStore = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentFengShuiScoreId = 1;
    this.currentChatMessageId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
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
    };
    this.chatMessagesStore.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesStore.values());
  }
}

export const storage = new MemStorage();
