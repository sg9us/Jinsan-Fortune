import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { authConfig } from '../config/auth';
import { storage } from '../storage';
import { User } from '@shared/schema';
import { log } from '../vite';

// 유저 직렬화 - 세션에 저장될 정보 정의
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 유저 역직렬화 - 세션에서 사용자 정보 복원
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || false);
  } catch (err) {
    done(err, false);
  }
});

// 네이버 OAuth 전략
if (authConfig.naver.clientID && authConfig.naver.clientSecret) {
  passport.use(
    new NaverStrategy(
      {
        clientID: authConfig.naver.clientID,
        clientSecret: authConfig.naver.clientSecret,
        callbackURL: authConfig.naver.callbackURL,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // 이미 가입한 사용자인지 확인
          const existingUser = await storage.getUserByProviderId('naver', profile.id);
          
          if (existingUser) {
            // 기존 사용자인 경우 로그인 시간 업데이트
            const updatedUser = await storage.updateUserLoginTime(existingUser.id);
            return done(null, updatedUser);
          }
          
          // 새 사용자 생성
          const newUser = await storage.createUser({
            provider: 'naver',
            providerId: profile.id,
            nickname: profile.displayName || '사용자',
            email: profile.emails?.[0]?.value || null
          });
          
          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  log('네이버 OAuth 전략이 등록되었습니다.', 'passport');
} else {
  log('네이버 OAuth 클라이언트 ID 또는 시크릿이 제공되지 않아 네이버 로그인이 비활성화됩니다.', 'passport');
}

// 카카오 OAuth 전략
if (authConfig.kakao.clientID && authConfig.kakao.clientSecret) {
  passport.use(
    new KakaoStrategy(
      {
        clientID: authConfig.kakao.clientID,
        clientSecret: authConfig.kakao.clientSecret,
        callbackURL: authConfig.kakao.callbackURL,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // 이미 가입한 사용자인지 확인
          const existingUser = await storage.getUserByProviderId('kakao', profile.id);
          
          if (existingUser) {
            // 기존 사용자인 경우 로그인 시간 업데이트
            const updatedUser = await storage.updateUserLoginTime(existingUser.id);
            return done(null, updatedUser);
          }
          
          // 새 사용자 생성
          const newUser = await storage.createUser({
            provider: 'kakao',
            providerId: profile.id,
            nickname: profile.displayName || '사용자',
            email: profile._json?.kakao_account?.email || null
          });
          
          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  log('카카오 OAuth 전략이 등록되었습니다.', 'passport');
} else {
  log('카카오 OAuth 클라이언트 ID 또는 시크릿이 제공되지 않아 카카오 로그인이 비활성화됩니다.', 'passport');
}

export default passport;