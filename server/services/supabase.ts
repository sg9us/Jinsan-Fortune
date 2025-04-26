import { createClient } from '@supabase/supabase-js';
import { log } from '../vite';

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// 환경 변수 확인
if (!supabaseUrl || !supabaseKey) {
  log('Supabase URL 또는 API 키가 제공되지 않았습니다. 일부 기능이 비활성화됩니다.', 'supabase');
  log('환경 변수를 확인하세요. SUPABASE_URL과 SUPABASE_API_KEY가 필요합니다.', 'supabase');
  log('주의: SUPABASE_API_KEY는 anon 키가 아닌 service_role 키여야 합니다!', 'supabase');
} else {
  log(`Supabase 클라이언트가 초기화되었습니다. (URL: ${supabaseUrl.substring(0, 20)}...)`, 'supabase');
  
  // 키가 service_role 키인지 확인 (간단한 휴리스틱)
  const isLikelyServiceRole = supabaseKey.includes('eyJ0') && supabaseKey.length > 100;
  
  if (!isLikelyServiceRole) {
    log('주의: SUPABASE_API_KEY가 service_role 키가 아닌 것 같습니다. RLS 정책을 우회하기 위해 service_role 키가 필요합니다.', 'supabase');
  } else {
    log('service_role 키로 Supabase 클라이언트를 초기화합니다. RLS 정책을 우회합니다.', 'supabase');
  }
}

// 서비스 역할 키로 클라이언트 초기화 (RLS 정책 우회)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 사용자 유형 정의
export interface SupabaseUser {
  id: string;
  provider: string;
  provider_id: string;
  nickname: string;
  email: string | null;
  is_admin?: boolean;
  created_at: string;
  last_login_at: string;
}

// Supabase 사용자 서비스
export const userService = {
  // 공급자 ID로 사용자 찾기
  async getUserByProviderId(provider: string, providerId: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // 결과를 찾을 수 없음 오류 코드는 무시
        log(`사용자 조회 오류: ${error.message}`, 'supabase');
      }
      return null;
    }
    
    return data as SupabaseUser;
  },
  
  // 사용자 생성 (자동 회원가입)
  async createUser(userData: {
    provider: string;
    provider_id: string;
    nickname?: string;
    email?: string | null;
  }): Promise<SupabaseUser | null> {
    try {
      // 중복 확인 - provider_id가 동일한 사용자가 있는지 확인
      const existingUser = await this.getUserByProviderId(userData.provider, userData.provider_id);
      if (existingUser) {
        log(`이미 존재하는 사용자입니다: ${userData.provider} / ${userData.provider_id}`, 'supabase');
        return existingUser;
      }
      
      const now = new Date().toISOString();
      
      // 기본값 설정 - 누락된 필드에 대한 처리
      const nickname = userData.nickname || `${userData.provider} 사용자`;
      const email = userData.email || null;
      
      // 로그 추가
      log(`새 사용자 생성 시도: ${JSON.stringify({
        provider: userData.provider,
        provider_id: userData.provider_id,
        nickname: nickname,
        email: email ? email.substring(0, 3) + '...' : null
      })}`, 'supabase');
      
      // 서비스 역할 키로 RLS 정책 우회
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            provider: userData.provider,
            provider_id: userData.provider_id,
            nickname: nickname,
            email: email,
            is_admin: false,
            created_at: now,
            last_login_at: now
          }
        ])
        .select()
        .single();
      
      if (error) {
        log(`사용자 생성 오류: ${error.message} (코드: ${error.code})`, 'supabase');
        
        // 401 오류 세부 정보 로깅 (인증 관련)
        if (error.code === '401' || error.status === 401) {
          log('401 인증 오류 - service_role 키를 확인하세요. anon 키가 아닌 service_role 키가 필요합니다!', 'supabase');
          log('Supabase Project Settings -> API -> service_role 키를 사용하세요', 'supabase');
        }
        
        // 406 오류 세부 정보 로깅 (RLS 정책 관련)
        if (error.code === '406' || error.status === 406) {
          log('406 오류 - RLS 정책이 삽입 작업을 차단했습니다', 'supabase');
          log('다음 옵션 중 하나를 선택하세요:', 'supabase');
          log('1. service_role 키를 사용하여 RLS를 우회하세요 (권장)', 'supabase');
          log('2. Supabase에서 해당 테이블의 RLS 정책을 수정하세요', 'supabase');
          log('3. Supabase에서 해당 테이블의 RLS를 잠시 비활성화하세요 (테스트용)', 'supabase');
        }
        
        // 중복 키 (이미 존재하는 사용자)
        if (error.code === 'PGRST409' || error.code === '23505') {
          log('이미 존재하는 사용자 - 다시 조회 시도', 'supabase');
          const existingUser = await this.getUserByProviderId(userData.provider, userData.provider_id);
          if (existingUser) {
            return existingUser;
          }
        }
        
        return null;
      }
      
      log(`사용자 생성 성공: ${data.nickname} (ID: ${data.id})`, 'supabase');
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`사용자 생성 중 예외 발생: ${errorMessage}`, 'supabase');
      return null;
    }
  },
  
  // 마지막 로그인 시간 업데이트
  async updateLastLoginTime(userId: string): Promise<SupabaseUser | null> {
    try {
      log(`사용자 로그인 시간 업데이트 시도: ID ${userId}`, 'supabase');
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .update({
          last_login_at: now
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        log(`사용자 로그인 시간 업데이트 오류: ${error.message} (코드: ${error.code})`, 'supabase');
        
        // 사용자를 찾을 수 없는 경우 다시 조회
        if (error.code === 'PGRST116') {
          log(`사용자를 찾을 수 없음 - ID로 다시 조회 시도: ${userId}`, 'supabase');
          const user = await this.getUserById(userId);
          return user;
        }
        
        return null;
      }
      
      log(`사용자 로그인 시간 업데이트 성공: ${data.nickname} (ID: ${data.id})`, 'supabase');
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`사용자 로그인 시간 업데이트 중 예외 발생: ${errorMessage}`, 'supabase');
      return null;
    }
  },
  
  // ID로 사용자 얻기
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    try {
      if (!userId) {
        log('유효하지 않은 사용자 ID: 빈 문자열 또는 undefined', 'supabase');
        return null;
      }
      
      log(`ID로 사용자 조회: ${userId}`, 'supabase');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // 결과 없음 에러는 조용히 처리
          log(`사용자 ID 조회 오류: ${error.message} (코드: ${error.code})`, 'supabase');
        } else {
          log(`ID ${userId}에 해당하는 사용자를 찾을 수 없습니다`, 'supabase');
        }
        return null;
      }
      
      log(`사용자 조회 성공: ${data.nickname} (ID: ${data.id})`, 'supabase');
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`사용자 ID 조회 중 예외 발생: ${errorMessage}`, 'supabase');
      return null;
    }
  }
};