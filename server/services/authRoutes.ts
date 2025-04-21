import { Router, Request, Response } from 'express';
import passport from './passport';
import { authConfig, successRedirect, failureRedirect } from '../config/auth';
import { User } from '@shared/schema';
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
const formatUserInfo = (user: User) => {
  return {
    id: user.id,
    nickname: user.nickname,
    provider: user.provider,
    email: user.email,
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
    
    router.get(
      '/naver/callback',
      passport.authenticate('naver', { 
        successRedirect,
        failureRedirect
      })
    );
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
    router.get('/kakao', passport.authenticate('kakao'));
    
    router.get(
      '/kakao/callback',
      passport.authenticate('kakao', { 
        successRedirect,
        failureRedirect
      })
    );
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
    
    res.json(formatUserInfo(req.user as User));
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