import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { authConfig } from '../config/auth';
import { userService, SupabaseUser } from './supabase';
import { log } from '../vite';

// 유저 직렬화 - 세션에 저장될 정보 정의
passport.serializeUser((user: SupabaseUser, done) => {
  done(null, user.id);
});

// 유저 역직렬화 - 세션에서 사용자 정보 복원
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.getUserById(id);
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
          // 네이버 프로필 정보 로깅
          log(`네이버 로그인 프로필: ${JSON.stringify({
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value || '없음',
            hasEmail: !!(profile.emails && profile.emails.length > 0)
          })}`, 'passport');
          
          // 이미 가입한 사용자인지 확인
          const existingUser = await userService.getUserByProviderId('naver', profile.id);
          
          if (existingUser) {
            // 기존 사용자인 경우 로그인 시간 업데이트
            log(`기존 네이버 사용자 로그인: ${existingUser.nickname} (ID: ${existingUser.id})`, 'passport');
            const updatedUser = await userService.updateLastLoginTime(existingUser.id);
            if (!updatedUser) {
              log('로그인 시간 업데이트 실패', 'passport');
              return done(new Error('로그인 시간 업데이트 중 오류가 발생했습니다'), false);
            }
            return done(null, updatedUser);
          }
          
          // 새 사용자 생성 (자동 회원가입)
          log(`새 네이버 사용자 자동 등록 시도: ${profile.displayName || '이름 없음'} (네이버 ID: ${profile.id})`, 'passport');
          
          // 프로필에서 필요한 정보 추출
          let displayName = '';
          if (profile.displayName && profile.displayName.trim() !== '') {
            displayName = profile.displayName;
          } else if (profile._json && profile._json.nickname) {
            displayName = profile._json.nickname;
          } else {
            displayName = '네이버 사용자';
          }
          
          // 이메일 정보 추출
          let email = null;
          if (profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
            email = profile.emails[0].value;
          } else if (profile._json && profile._json.email) {
            email = profile._json.email;
          }
          
          const userData = {
            provider: 'naver',
            provider_id: profile.id,
            nickname: displayName,
            email: email
          };
          
          try {
            const newUser = await userService.createUser(userData);
            
            if (!newUser) {
              log(`네이버 사용자 생성 실패: ${JSON.stringify({
                ...userData,
                email: userData.email ? userData.email.substring(0, 3) + '...' : null
              })}`, 'passport');
              return done(new Error('사용자 생성 중 오류가 발생했습니다'), false);
            }
            
            log(`새 네이버 사용자 등록 완료: ${newUser.nickname} (ID: ${newUser.id})`, 'passport');
            return done(null, newUser);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log(`네이버 사용자 생성 중 예외 발생: ${errorMessage}`, 'passport');
            return done(new Error(`네이버 사용자 생성 중 오류: ${errorMessage}`), false);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log(`네이버 인증 오류: ${errorMessage}`, 'passport');
          return done(new Error(`네이버 인증 처리 중 오류가 발생했습니다: ${errorMessage}`), false);
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
          // 카카오 프로필 정보 로깅
          log(`카카오 로그인 프로필: ${JSON.stringify({
            id: profile.id,
            displayName: profile.displayName,
            email: profile._json?.kakao_account?.email || '없음',
            hasEmail: !!profile._json?.kakao_account?.email
          })}`, 'passport');
          
          // 이미 가입한 사용자인지 확인
          const existingUser = await userService.getUserByProviderId('kakao', profile.id);
          
          if (existingUser) {
            // 기존 사용자인 경우 로그인 시간 업데이트
            log(`기존 카카오 사용자 로그인: ${existingUser.nickname} (ID: ${existingUser.id})`, 'passport');
            const updatedUser = await userService.updateLastLoginTime(existingUser.id);
            if (!updatedUser) {
              log('로그인 시간 업데이트 실패', 'passport');
              return done(new Error('로그인 시간 업데이트 중 오류가 발생했습니다'), false);
            }
            return done(null, updatedUser);
          }
          
          // 새 사용자 생성 (자동 회원가입)
          log(`새 카카오 사용자 자동 등록 시도: ${profile.displayName || '이름 없음'} (카카오 ID: ${profile.id})`, 'passport');
          
          // 프로필에서 필요한 정보 추출
          let displayName = '';
          if (profile.displayName && profile.displayName.trim() !== '') {
            displayName = profile.displayName;
          } else if (profile._json?.properties?.nickname) {
            displayName = profile._json.properties.nickname;
          } else {
            displayName = '카카오 사용자';
          }
          
          // 이메일 정보 추출
          let email = null;
          if (profile._json?.kakao_account?.email) {
            email = profile._json.kakao_account.email;
          }
          
          const userData = {
            provider: 'kakao',
            provider_id: profile.id,
            nickname: displayName,
            email: email
          };
          
          try {
            const newUser = await userService.createUser(userData);
            
            if (!newUser) {
              log(`카카오 사용자 생성 실패: ${JSON.stringify({
                ...userData,
                email: userData.email ? userData.email.substring(0, 3) + '...' : null
              })}`, 'passport');
              return done(new Error('사용자 생성 중 오류가 발생했습니다'), false);
            }
            
            log(`새 카카오 사용자 등록 완료: ${newUser.nickname} (ID: ${newUser.id})`, 'passport');
            return done(null, newUser);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log(`카카오 사용자 생성 중 예외 발생: ${errorMessage}`, 'passport');
            return done(new Error(`카카오 사용자 생성 중 오류: ${errorMessage}`), false);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log(`카카오 인증 오류: ${errorMessage}`, 'passport');
          return done(new Error(`카카오 인증 처리 중 오류가 발생했습니다: ${errorMessage}`), false);
        }
      }
    )
  );
  log('카카오 OAuth 전략이 등록되었습니다.', 'passport');
} else {
  log('카카오 OAuth 클라이언트 ID 또는 시크릿이 제공되지 않아 카카오 로그인이 비활성화됩니다.', 'passport');
}

export default passport;