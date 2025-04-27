import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { log, printServerBanner } from "./utils/logger";
import passport from "./services/passport";
import { authConfig } from "./config/auth";
import { createAuthRouter } from "./services/authRoutes";

// Supabase 환경 변수 초기화
if (!process.env.SUPABASE_URL && process.env.SUPABASE_URL_saju) {
  process.env.SUPABASE_URL = process.env.SUPABASE_URL_saju;
  log.info('Supabase URL 환경 변수가 설정되었습니다.', 'supabase');
}

if (!process.env.SUPABASE_API_KEY && process.env.SUPABASE_API_KEY_saju) {
  process.env.SUPABASE_API_KEY = process.env.SUPABASE_API_KEY_saju;
  log.info('Supabase API 키 환경 변수가 설정되었습니다.', 'supabase');
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(session(authConfig.session));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 인증 라우터 설정 - 두 가지 경로 모두 지원
const authRouter = createAuthRouter();
app.use('/auth', authRouter);
app.use('/api/auth', authRouter); // 배포 환경에서 사용되는 API 경로도 지원

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log.info(logLine, 'express');
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log.error(`서버 오류 발생: ${status} - ${message}`, 'express');
    
    if (err.stack) {
      log.error(`오류 스택: ${err.stack}`, 'express');
    }
    
    if (err.originalError) {
      log(`원본 오류: ${JSON.stringify(err.originalError)}`, 'express');
    }
    
    if (status === 500) {
      // 500 에러는 보안을 위해 자세한 내용을 클라이언트에 노출하지 않음
      res.status(status).json({ message: "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } else {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    const host = process.env.APP_URL || `http://localhost:${port}`;
    printServerBanner(port, host);
    
    // OAuth 상태 로깅
    if (authConfig.naver.clientID && authConfig.kakao.clientID) {
      log.success('모든 OAuth 제공자가 구성되었습니다', 'auth');
    } else {
      const missingProviders = [];
      if (!authConfig.naver.clientID) missingProviders.push('네이버');
      if (!authConfig.kakao.clientID) missingProviders.push('카카오');
      log.warn(`일부 OAuth 제공자가 구성되지 않았습니다: ${missingProviders.join(', ')}`, 'auth');
    }
    
    // 데이터베이스 상태 로깅
    if (process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY) {
      log.success('Supabase 데이터베이스에 연결되었습니다', 'database');
    } else {
      log.error('Supabase 연결 정보가 누락되었습니다', 'database');
    }
  });
})();
