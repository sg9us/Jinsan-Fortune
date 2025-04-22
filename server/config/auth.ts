// OAuth 제공자 설정 정보
export const authConfig = {
  // 세션 및 쿠키 설정
  session: {
    secret: process.env.SESSION_SECRET || 'paljanotemock-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1일
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  },
  
  // 네이버 OAuth 설정
  naver: {
    clientID: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackURL: process.env.NAVER_CALLBACK_URL || 'http://localhost:5000/auth/naver/callback'
  },
  
  // 카카오 OAuth 설정
  kakao: {
    clientID: process.env.KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:5000/auth/kakao/callback'
  }
};

// 인증 후 리디렉션할 URL
export const successRedirect = '/auth/success';
export const failureRedirect = '/auth/failure';

// 사용자 세션 타입 정의
export interface UserSession {
  id: string;
  nickname: string;
  provider: string;
  provider_id: string;
  email: string | null;
  created_at: string;
  last_login_at: string;
  isAuthenticated: boolean;
}