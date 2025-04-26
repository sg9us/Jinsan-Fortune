// 배포 환경 감지
const isProduction = process.env.NODE_ENV === 'production';

// 기본 호스트 설정 (배포/개발 환경에 따라 다름)
const defaultHost = isProduction 
  ? (process.env.APP_URL || 'https://your-app-domain.replit.app') 
  : 'http://localhost:5000';

// 네이버 콜백 URL 설정
const getNaverCallbackUrl = () => {
  // 1. 환경 변수에 설정된 경우 이를 사용
  if (process.env.NAVER_CALLBACK_URL) {
    return process.env.NAVER_CALLBACK_URL;
  }
  
  // 2. 배포 환경에서는 /api/auth/callback/naver 형식 사용
  if (isProduction) {
    return `${defaultHost}/api/auth/callback/naver`;
  }
  
  // 3. 개발 환경에서는 /auth/naver/callback 형식 사용
  return `${defaultHost}/auth/naver/callback`;
};

// 카카오 콜백 URL 설정
const getKakaoCallbackUrl = () => {
  // 1. 환경 변수에 설정된 경우 이를 사용
  if (process.env.KAKAO_CALLBACK_URL) {
    return process.env.KAKAO_CALLBACK_URL;
  }
  
  // 2. 배포 환경에서는 /api/auth/callback/kakao 형식 사용
  if (isProduction) {
    return `${defaultHost}/api/auth/callback/kakao`;
  }
  
  // 3. 개발 환경에서는 /auth/kakao/callback 형식 사용
  return `${defaultHost}/auth/kakao/callback`;
};

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
      secure: isProduction
    }
  },
  
  // 네이버 OAuth 설정
  naver: {
    clientID: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackURL: getNaverCallbackUrl()
  },
  
  // 카카오 OAuth 설정
  kakao: {
    clientID: process.env.KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: getKakaoCallbackUrl()
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