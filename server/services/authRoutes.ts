import { Router, Request, Response } from 'express';
import passport from './passport';
import { authConfig, successRedirect, failureRedirect } from '../config/auth';
import { SupabaseUser, supabase, userService } from './supabase';

// 로그 함수 정의
const log = (message: string, context?: string) => {
  const prefix = context ? `[${context}]` : '';
  console.log(`${prefix} ${message}`);
};

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
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    gender: user.gender,
    birthdate: user.birthdate,
    birthTime: user.birth_time,
    isTimeUnknown: user.is_time_unknown,
    ageRange: user.age_range,
    isRegistered: user.is_registered,
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

  // 로그인 성공 페이지 - 회원가입 완료 여부에 따라 리디렉션
  router.get('/success', (req, res) => {
    // 사용자가 로그인되어 있고 회원가입이 필요한 경우 리디렉션
    if (req.isAuthenticated() && req.user) {
      const user = req.user as SupabaseUser;
      if (!user.is_registered) {
        log(`미등록 사용자 - 회원가입 페이지로 리디렉션: ${user.nickname} (ID: ${user.id})`, 'auth');
        return res.redirect('/register');
      }
    }
    // 회원가입이 완료되었거나 로그인 정보가 없는 경우 홈으로 리디렉션
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
  
  // 회원가입 완료 (추가 정보 입력)
  router.post('/register', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: '인증되지 않은 사용자입니다.' });
      }
      
      const { 
        fullName, 
        phoneNumber, 
        gender, 
        birthYear, 
        birthMonth, 
        birthDay,
        birthTime,
        isTimeUnknown,
        ageRange
      } = req.body;
      
      // 필수 정보 검증
      if (!fullName || !phoneNumber || !gender || !birthYear || !birthMonth || !birthDay) {
        return res.status(400).json({ 
          success: false, 
          message: '필수 입력 항목을 모두 작성해주세요.' 
        });
      }
      
      // 생년월일 포맷팅
      const birthdate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      
      const user = req.user as SupabaseUser;
      log(`회원가입 정보 업데이트 시도: ${user.nickname} (ID: ${user.id})`, 'auth');
      
      // Supabase 사용자 정보 업데이트
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          gender: gender,
          birthdate: birthdate,
          birth_time: isTimeUnknown ? null : birthTime,
          is_time_unknown: isTimeUnknown || false,
          age_range: ageRange,
          is_registered: true
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        log(`회원가입 정보 업데이트 오류: ${error.message}`, 'auth');
        return res.status(500).json({ 
          success: false, 
          message: '회원정보 저장 중 오류가 발생했습니다.' 
        });
      }
      
      log(`회원가입 완료: ${fullName} (ID: ${user.id})`, 'auth');
      
      // 업데이트된 사용자 정보를 세션에 반영
      req.login(data, (err) => {
        if (err) {
          log(`세션 업데이트 오류: ${err.message}`, 'auth');
          return res.status(500).json({ 
            success: false, 
            message: '세션 업데이트 중 오류가 발생했습니다.' 
          });
        }
        
        return res.json({ 
          success: true, 
          message: '회원가입이 완료되었습니다.',
          user: formatUserInfo(data)
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`회원가입 처리 중 예외 발생: ${errorMessage}`, 'auth');
      
      res.status(500).json({ 
        success: false, 
        message: '회원가입 처리 중 오류가 발생했습니다.' 
      });
    }
  });

  // 이메일/비밀번호 회원가입
  router.post('/email/signup', async (req, res) => {
    try {
      const { email, password, confirmPassword, nickname } = req.body;
      
      // 필수 필드 검증
      if (!email || !password || !confirmPassword || !nickname) {
        return res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요.'
        });
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '유효한 이메일 주소를 입력해주세요.'
        });
      }
      
      // 닉네임 길이 검증
      if (nickname.length < 2) {
        return res.status(400).json({
          success: false,
          message: '닉네임은 2자 이상이어야 합니다.'
        });
      }
      
      // 비밀번호 길이 검증
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 8자 이상이어야 합니다.'
        });
      }
      
      // 비밀번호 문자 및 숫자 포함 검증
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 문자와 숫자를 모두 포함해야 합니다.'
        });
      }
      
      // 비밀번호 일치 검증
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '비밀번호가 일치하지 않습니다.'
        });
      }
      
      try {
        // Supabase Auth를 통한 사용자 생성 시도
        const user = await userService.signUpWithEmail(email, password, nickname);
        
        if (!user) {
          return res.status(500).json({
            success: false,
            message: '회원가입 처리 중 오류가 발생했습니다.'
          });
        }
        
        // 세션에 사용자 정보 저장
        req.login(user, (err) => {
          if (err) {
            log(`세션 저장 오류: ${err.message}`, 'auth');
            return res.status(500).json({
              success: false,
              message: '로그인 세션 생성 중 오류가 발생했습니다.'
            });
          }
          
          // 성공 응답
          res.json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            user: formatUserInfo(user)
          });
        });
      } catch (error: any) {
        // Supabase 오류 처리
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`회원가입 처리 중 Supabase 오류: ${errorMessage}`, 'auth');
        
        if (errorMessage.includes("이미 가입된 이메일")) {
          return res.status(409).json({
            success: false,
            message: '이미 가입된 이메일 주소입니다.'
          });
        } else {
          return res.status(500).json({
            success: false,
            message: errorMessage || '회원가입 처리 중 오류가 발생했습니다.'
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`이메일 회원가입 처리 중 오류: ${errorMessage}`, 'auth');
      
      res.status(500).json({
        success: false,
        message: '회원가입 처리 중 오류가 발생했습니다.'
      });
    }
  });
  
  // 이메일/비밀번호 로그인 - Supabase Auth 직접 사용
  router.post('/email/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // 필수 필드 검증
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 모두 입력해주세요.'
        });
      }
      
      try {
        console.log(`[auth] 이메일 로그인 시도: ${email.substring(0, 3)}...`);
        
        // userService 통해 Supabase Auth 인증 요청
        let user: SupabaseUser;
        
        try {
          user = await userService.signInWithEmail(email, password);
          console.log(`[auth] Supabase Auth로 로그인 성공: ${email.substring(0, 3)}...`);
        } catch (authError: any) {
          console.log(`[auth] Supabase Auth 로그인 오류: ${authError.message}`);
          
          if (authError.message.includes("이메일 또는 비밀번호가 올바르지 않습니다")) {
            return res.status(401).json({
              success: false,
              message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
          } else {
            return res.status(500).json({
              success: false,
              message: authError.message || '로그인 처리 중 오류가 발생했습니다.'
            });
          }
        }
        
        if (!user) {
          console.log('[auth] 로그인 후 사용자 정보를 받지 못했습니다');
          return res.status(500).json({
            success: false,
            message: '로그인 후 사용자 정보를 받지 못했습니다.'
          });
        }
        
        // 세션에 사용자 정보 저장
        console.log(`[auth] 세션에 사용자 정보 저장: ${user.nickname} (ID: ${user.id})`);
        req.login(user, (err) => {
          if (err) {
            console.log(`[auth] 세션 저장 오류: ${err.message}`);
            return res.status(500).json({
              success: false,
              message: '로그인 세션 생성 중 오류가 발생했습니다.'
            });
          }
          
          // 성공 응답
          console.log(`[auth] 로그인 성공: ${user.nickname} (ID: ${user.id})`);
          return res.json({
            success: true,
            message: '로그인에 성공했습니다.',
            user: formatUserInfo(user),
            session: {
              isAuthenticated: true
            }
          });
        });
      } catch (error: any) {
        // 예외 처리
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`[auth] Supabase 로그인 중 예외 발생: ${errorMessage}`);
        
        return res.status(500).json({
          success: false,
          message: '로그인 처리 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[auth] 이메일 로그인 처리 중 예외 발생: ${errorMessage}`);
      
      res.status(500).json({
        success: false,
        message: '로그인 처리 중 오류가 발생했습니다.'
      });
    }
  });
  
  // 활성화된 제공자 로깅
  console.log(`[auth] 활성화된 인증 제공자: ${Object.entries(providers)
    .filter(([_, active]) => active)
    .map(([name]) => name)
    .join(', ') || '없음'}`);

  return router;
};