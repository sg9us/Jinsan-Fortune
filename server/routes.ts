import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertChatMessageSchema, insertReviewSchema } from "@shared/schema";
import { analyzeSaju } from "./services/openai";
import { analyzeFengShui, createFengShuiScore } from "./services/fengShuiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints - all with /api prefix

  // 관리자 미들웨어
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
      return next();
    }
    res.status(403).json({ message: '관리자 권한이 필요합니다' });
  };

  // 관리자 API 라우트
  app.get('/api/admin/bookings', isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
  });


  // Bookings API
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error getting bookings:", error);
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });

  // Saju Chat API
  app.post("/api/saju/analyze", async (req, res) => {
    try {
      const { birthdate, language } = req.body;

      if (!birthdate) {
        return res.status(400).json({ message: "Birthdate is required" });
      }

      // Store the user message
      await storage.createChatMessage({
        role: "user",
        content: birthdate,
        birthdate
      });

      // Get Saju analysis from OpenAI
      const analysis = await analyzeSaju(birthdate, language || "ko");

      // Store the assistant response
      const responseContent = JSON.stringify(analysis);
      await storage.createChatMessage({
        role: "assistant",
        content: responseContent,
        birthdate
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing Saju:", error);
      res.status(500).json({ message: "Failed to analyze Saju" });
    }
  });

  // Feng Shui API
  app.post("/api/fengshui/analyze", async (req, res) => {
    try {
      const { address, language } = req.body;

      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }

      // Check if we already have an analysis for this address
      const existingScore = await storage.getFengShuiScoreByAddress(address);

      if (existingScore) {
        return res.json(existingScore);
      }

      // Get new Feng Shui analysis
      const analysis = await analyzeFengShui(address, language || "ko");

      // Store the Feng Shui score
      const scoreData = createFengShuiScore(address, analysis);
      const score = await storage.createFengShuiScore(scoreData);

      res.json(score);
    } catch (error) {
      console.error("Error analyzing Feng Shui:", error);
      res.status(500).json({ message: "Failed to analyze Feng Shui" });
    }
  });

  // Chat messages API
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error getting chat messages:", error);
      res.status(500).json({ message: "Failed to retrieve chat messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(400).json({ message: error.message || "Invalid message data" });
    }
  });

  // Reviews API
  // 리뷰 목록 조회 API
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ message: "리뷰 목록을 가져오는데 실패했습니다" });
    }
  });
  
  // 사용자별 리뷰 목록 조회 API
  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getReviewsByUserId(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting user reviews:", error);
      res.status(500).json({ message: "사용자 리뷰 목록을 가져오는데 실패했습니다" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      // 로그인 확인
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다" });
      }
      
      // 사용자 ID 추출
      const userId = (req.user as any).id;
      
      // 리뷰 데이터 검증
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: error.message || "잘못된 리뷰 데이터입니다" });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      const review = await storage.getReviewById(id);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      console.error("Error getting review:", error);
      res.status(500).json({ message: "Failed to retrieve review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}