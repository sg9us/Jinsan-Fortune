import { Router, Request, Response } from 'express';
import passport from './passport';
import { authConfig, successRedirect, failureRedirect } from '../config/auth';
import { SupabaseUser } from './supabase';
import { log } from '../vite';

// 인증 확인 미들웨어
export const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // 인증되지 않은 경우 JSON 응답 반환
  res.status(401).json({ 
    isAuthenticated: false, 
    message: '로그인이 필요합니다' 
  });
};

// 사용자 정보 가공
const formatUserInfo = (user: SupabaseUser) => {
  return {
    id: user.id,
    nickname: user.nickname,
    provider: user.provider,
    provider_id: user.provider_id,
    email: user.email,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
    isAuthenticated: true
  };
};

// 인증 라우터 생성
export const createAuthRouter = () => {
  const router = Router();

  // 제공자 인증 상태
  const providers = {
    naver: !!authConfig.naver.clientID && !!authConfig.naver.clientSecret,
    kakao: !!authConfig.kakao.clientID && !!authConfig.kakao.clientSecret
  };

  // 활성화된 OAuth 제공자 목록 조회
  router.get('/providers', (req, res) => {
    res.json({
      providers: {
        naver: providers.naver,
        kakao: providers.kakao
      }
    });
  });

  // 네이버 로그인 (클라이언트 ID와 시크릿이 제공된 경우에만)
  if (providers.naver) {
    router.get('/naver', passport.authenticate('naver'));
    
    // 기존 콜백 경로
    router.get(
      '/naver/callback',
      passport.authenticate('naver', { 
        successRedirect,
        failureRedirect
      })
    );
    
    // API 경로 형식의 콜백 추가 (/api/auth/callback/naver)
    router.get(
      '/callback/naver',
      (req, res, next) => {
        log('네이버 콜백 호출됨 (API 경로): ' + req.originalUrl, 'auth');
        
        try {
          // 콜백 요청 파라미터 로깅
          log(`네이버 콜백 요청 파라미터: ${JSON.stringify({
            code: req.query.code ? '존재함' : '없음',
            error: req.query.error || '없음',
            state: req.query.state || '없음'
          })}`, 'auth');
          
          passport.authenticate('naver', { 
            successRedirect,
            failureRedirect,
            failWithError: true // 오류 정보 전달
          })(req, res, (err: any) => {
            if (err) {
              log(`네이버 인증 오류 발생: ${err.message || '알 수 없는 오류'}`, 'auth');
              // 오류 발생 시 실패 페이지로 리다이렉트
              return res.redirect(failureRedirect);
            }
            next();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log(`네이버 콜백 처리 중 예외 발생: ${errorMessage}`, 'auth');
          return res.redirect(failureRedirect);
        }
      }
    );
    
    log('네이버 OAuth 콜백 URL: ' + authConfig.naver.callbackURL, 'auth');
  } else {
    // 네이버 로그인이 비활성화된 경우 임시 에러 처리
    router.get('/naver', (req, res) => {
      res.status(503).json({ 
        error: '네이버 로그인이 현재 비활성화되어 있습니다. 관리자에게 문의하세요.' 
      });
    });
  }

  // 카카오 로그인 (클라이언트 ID와 시크릿이 제공된 경우에만)
  if (providers.kakao) {
    // 카카오 로그인 시도 시 사용된 리디렉트 URI 로깅
    router.get('/kakao', (req, res, next) => {
      log('카카오 로그인 요청 경로: ' + req.originalUrl, 'auth');
      log('카카오 로그인 리디렉트 URI: ' + authConfig.kakao.callbackURL, 'auth');
      
      passport.authenticate('kakao')(req, res, next);
    });
    
    // 기존 콜백 경로
    router.get(
      '/kakao/callback',
      (req, res, next) => {
        log('카카오 콜백 호출됨 (기존 경로): ' + req.originalUrl, 'auth');
        passport.authenticate('kakao', { 
          successRedirect,
          failureRedirect
        })(req, res, next);
      }
    );
    
    // API 경로 형식의 콜백 추가 (/api/auth/callback/kakao)
    router.get(
      '/callback/kakao',
      (req, res, next) => {
        log('카카오 콜백 호출됨 (API 경로): ' + req.originalUrl, 'auth');
        
        try {
          // 콜백 요청 파라미터 로깅
          log(`카카오 콜백 요청 파라미터: ${JSON.stringify({
            code: req.query.code ? '존재함' : '없음',
            error: req.query.error || '없음',
            state: req.query.state || '없음'
          })}`, 'auth');
          
          passport.authenticate('kakao', { 
            successRedirect,
            failureRedirect,
            failWithError: true // 오류 정보 전달
          })(req, res, (err: any) => {
            if (err) {
              log(`카카오 인증 오류 발생: ${err.message || '알 수 없는 오류'}`, 'auth');
              // 오류 발생 시 실패 페이지로 리다이렉트
              return res.redirect(failureRedirect);
            }
            next();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log(`카카오 콜백 처리 중 예외 발생: ${errorMessage}`, 'auth');
          return res.redirect(failureRedirect);
        }
      }
    );
    
    log('카카오 OAuth 콜백 URL 설정: ' + authConfig.kakao.callbackURL, 'auth');
  } else {
    // 카카오 로그인이 비활성화된 경우 임시 에러 처리
    router.get('/kakao', (req, res) => {
      res.status(503).json({ 
        error: '카카오 로그인이 현재 비활성화되어 있습니다. 관리자에게 문의하세요.' 
      });
    });
  }

  // 로그인 성공 페이지 - 클라이언트로 리디렉션
  router.get('/success', (req, res) => {
    res.redirect('/');
  });

  // 로그인 실패 페이지 - 클라이언트로 리디렉션
  router.get('/failure', (req, res) => {
    res.redirect('/login?error=1');
  });

  // 현재 사용자 정보 조회
  router.get('/me', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.json({ isAuthenticated: false });
    }
    
    res.json(formatUserInfo(req.user as SupabaseUser));
  });

  // 로그아웃
  router.post('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { 
        return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다' });
      }
      res.json({ message: '로그아웃 되었습니다' });
    });
  });

  // 활성화된 제공자 로깅
  log(`활성화된 인증 제공자: ${Object.entries(providers)
    .filter(([_, active]) => active)
    .map(([name]) => name)
    .join(', ') || '없음'}`, 'auth');

  return router;
};