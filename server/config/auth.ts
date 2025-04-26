// 배포 환경 감지 - APP_URL이 설정되어 있으면 배포 환경으로 간주
// 개발 환경에서도 배포 환경의 콜백 URL을 사용하기 위해 강제 설정
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.APP_URL;

// 기본 호스트 설정 (항상 APP_URL 우선, 없으면 기본값)
const defaultHost = process.env.APP_URL || 'https://jinsan-fortune.replit.app';

// 서버 시작 시 현재 호스트 정보 로깅
const logHost = () => {
  console.log(`현재 호스트: ${defaultHost}, 환경: ${isProduction ? '배포' : '개발'}`);
  if (process.env.APP_URL) {
    console.log(`APP_URL 환경 변수: ${process.env.APP_URL}`);
  }
};

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
  
  // 1-1. 직접 전체 URL로 설정했다면 그것을 사용
  const hardcodedUrl = 'https://jinsan-fortune.replit.app/api/auth/callback/kakao';
  
  // 2. 배포 환경에서는 /api/auth/callback/kakao 형식 사용
  if (isProduction) {
    return hardcodedUrl; // `${defaultHost}/api/auth/callback/kakao` 대신 직접 URL 사용
  }
  
  // 3. 개발 환경에서는 /auth/kakao/callback 형식 사용
  return `${defaultHost}/auth/kakao/callback`;
};

// 호스트 정보 로깅
logHost();

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